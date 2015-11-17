import { _, log, fsAsync } from 'azk';
import { async, mapPromises } from 'azk/utils/promises';
import { UIProxy } from 'azk/cli/ui';
import { SugestionChooser } from 'azk/generator/sugestion_chooser';

var glob = require('glob');
var path = require('path');

/**
  * -------------------
  *   Court
  * -------------------
  *
  * ## More generators
  * - from issue #46: Adding more generators
  * - Details at https://github.com/azukiapp/azk/pull/149
  *
  * Investigates directories looking for files that can define the systems.
  * Suggests `docker images` that match systems requirements for each folder.
  *
  * -----------
  * ## Main Flow
  *
  * - Cmd Init():
  *     return generator.findSystems(cwd).then(function (systemsData) {
  *     });
  *
  * - Generator findSystems(dir):
  *     this.court.judge(dir);
  *     return this.court.systems_suggestions;
  *
  * - Court judge(dir):
  *   judge(dir) {
  *     this.__root_folder = dir;
  *
  *     ### _investigate(dir);
  *      - For each rule receives `relevantsFiles` to search
  *      - Get relevant files with its `contents`
  *      - For each detected file executes `rule.getEvidence()`
  *
  *     ### _analysis
  *       - check if the `evidence` has a `replaces` array
  *       - `_replacesEvidences`(): replaces other evidences on the same path (system)
  *
  *     ### _veredict()
  *       - fills `__folder_evidences_suggestion` with found evidences grouping in folders(systems)
  *       - set `system name`
  *       - set `database dependencies` for `[framework,runtime]` suggestions
  *       - finally converts `__folder_evidences_suggestion` to  `__systems_suggestions`
  *         for the Azkfile `mustache template`
  *   }
  *
  * - Cmd Init():
  *     generator.render({ systems: systemsData }, file);
  *
  **/
export class Court extends UIProxy {
  constructor(rules_folder, ui) {
    super(ui);

    this.sugestionChooser = new SugestionChooser(path.join(__dirname, "suggestions"), this);

    this.__rules = {
      runtime   : [],
      database  : [],
      framework : [],
      worker    : [],
      task      : [],
    };

    this.__evidences = [];
    this.__evidences_by_folder = [];
    this.__folder_evidences_suggestion = [];
    this.__systems_suggestions = [];

    // Load default rules
    this.load(rules_folder);
    log.debug('Court :: rules loaded:', this.rules.length);
  }

  get rules() {
    return this.__rules.runtime
      .concat(this.__rules.framework)
      .concat(this.__rules.database)
      .concat(this.__rules.worker)
      .concat(this.__rules.task);
  }

  get systems_suggestions() {
    return this.__systems_suggestions;
  }

  load(dir) {
    _.each(glob.sync(path.join(dir, '**/*.js')), (file) => {
      var Rule = require(file).Rule;
      if (Rule) {
        var rule = new Rule(this);
        if (_.isArray(this.__rules[rule.type])) {
          rule.name = path.basename(file, '.js');
          this.__rules[rule.type].push(rule);
        }
      }
    });
  }

  rule(name) {
    return _.find(this.rules, (rule) => { return rule.name == name; });
  }

  relevantsFiles() {
    var allRelevantFiles = [];
    this.rules.forEach(function(rule) {
      var ruleFiles = rule.relevantsFiles();
      allRelevantFiles = _.union(allRelevantFiles, ruleFiles);
    });
    return allRelevantFiles;
  }

  _relevantProjectFiles(projectDir, relevantsFilesList) {
    var foundedFiles = [];

    // search for each relevant file in projects folder
    relevantsFilesList.forEach((fileToSearch) => {
      var foundFiles = this._searchFile(projectDir, fileToSearch);
      foundedFiles = _.union(foundedFiles, foundFiles);
    });

    return foundedFiles;
  }

  _searchFile(dir, file_name) {
    var pattern = path.join(dir, file_name);

    var files = glob.sync(pattern);
    return _.filter(files, (file) => !_.isEmpty(file));
  }

  _investigate(dir) {
    return async(this, function* () {
      var evidences = [],
          filesToSearch = [],
          relevantFiles = [],
          projectFiles = [];

      // rules's files to search
      filesToSearch = _.map(this.rules, (rule) => {
        return rule.relevantsFiles();
      });
      filesToSearch = _.flatten(filesToSearch);
      log.debug('Court._investigate', { filesToSearch });

      // relevant files in the project folder
      projectFiles = this._relevantProjectFiles(dir, filesToSearch);
      // search in project subfolders if projectFiles is empty
      if (_.isEmpty(projectFiles)) {
        projectFiles = this._relevantProjectFiles(path.join(dir, '*'), filesToSearch);
      }

      projectFiles = _.flatten(projectFiles);
      projectFiles = _.union(projectFiles);
      log.debug('Court._investigate', { projectFiles });

      // relevant files with its contents
      relevantFiles = yield mapPromises(projectFiles, function(fullpath) {
        return async(this, function* () {
          var content = yield fsAsync.readFile(fullpath);
          return {
            fullpath: fullpath,
            content: content.toString()
          };
        });
      });

      // get evidence for each rule
      _.forEach (relevantFiles, function(file) {
        var basename = path.basename(file.fullpath);
        _.forEach(this.rules, function(rule) {
          var isRelevantFile = _.contains(rule.relevantsFiles(), basename);
          if (isRelevantFile) {
            var evidence = rule.getEvidence(file.fullpath, file.content);
            if (evidence) {
              evidences.push(evidence);
            }
          }
        });
      }, this);
      this.__evidences = evidences;
    });
  }

  _replacesEvidences() {
    var groupedByDir = this._getEvidencesByFolder();

    _.forEach(groupedByDir, function(evidences) {
      // var result = [];
      var filter_by_name = [];

      _.forEach(evidences, function(evidence) {
        _.forEach(evidences, function(item) {
          // checks that this evidence should be replaced
          if (_.has(item, 'replaces') && _.contains(item.replaces, evidence.name)) {
            filter_by_name.push(evidence.name);
          }
        });
      });

      filter_by_name = _.uniq(filter_by_name);

      // remove evidences to be replaced
      _.remove(evidences, function(evidence) {
        var willRemove = _.contains(filter_by_name, evidence.name);

        if (willRemove) {
          log.debug('Court._replacesEvidences', {
            name             : evidence.ruleName,
            relevantFile     : evidence.fullpath,
            evidenceReplaces : evidence.replaces,
            willReplaces     : filter_by_name,
          });
        }
        return willRemove;
      });
    });

    this.__evidences_by_folder = groupedByDir;
  }

  _getEvidencesByFolder() {
    return _.groupBy(this.__evidences, function(evidence) {
      return path.dirname(evidence.fullpath);
    });
  }

  _folderBasename(fullpath) {
    return path.basename(fullpath).replace(/_/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  }

  _analysis() {
    this._replacesEvidences();
    this.__folder_evidences_suggestion = [];
    _.forEach(this.__evidences_by_folder, function(value, key) {
      var folders_evidence_suggestion = this.sugestionChooser.suggest(value);
      this.__folder_evidences_suggestion.push({
        path: key,
        suggestions: folders_evidence_suggestion
      });
    }, this);
  }

  _veredict() {
    _.forEach(this.__folder_evidences_suggestion, function(folder_evidence_suggestion) {
      var systemName = '';
      var folderName = folder_evidence_suggestion.path;
      var evidences_suggestion = folder_evidence_suggestion.suggestions;

      // set system name
      _.forEach(evidences_suggestion, function(evidence_suggestion) {
        var folderBasename = this._folderBasename(folderName);

        if (evidence_suggestion.ruleType === 'runtime' || evidence_suggestion.ruleType === 'framework'  ) {
          systemName = folderBasename;
        } else if ( evidence_suggestion.ruleType === 'database') {
          systemName = evidence_suggestion.name;
        }
        var suggestion = evidence_suggestion.suggestionChoosen.suggestion;
        suggestion.name = systemName;
      }, this);

      // get all database suggestions
      var databaseSuggestions = _.filter(evidences_suggestion, function(evidence_suggestion) {
        return evidence_suggestion.ruleType === 'database';
      });

      // get all [framework,runtime] suggestions
      var runtimeFrameWorkSuggestions = _.filter(evidences_suggestion, function(evidence_suggestion) {
        var isRuntimeOrFramework =  evidence_suggestion.ruleType === 'runtime' ||
                                    evidence_suggestion.ruleType === 'framework';
        return isRuntimeOrFramework;
      });

      // include database dependency on [framework,runtime] suggestions
      if (databaseSuggestions.length > 0 && runtimeFrameWorkSuggestions.length > 0) {
        _.forEach(runtimeFrameWorkSuggestions, function(system) {
          var runtimeFrameWorkSuggestions = system.suggestionChoosen.suggestion;
          var firstDatabaseName = databaseSuggestions[0].suggestionChoosen.suggestion.name;
          runtimeFrameWorkSuggestions.depends = [firstDatabaseName];
          log.debug('Court._veredict - runtimeFrameWorkSuggestions.depends', {
            who      : runtimeFrameWorkSuggestions.name,
            dependsOn: runtimeFrameWorkSuggestions.depends });
        }, this);
      }
    }, this);

    this.__systems_suggestions = this.__convertFoldersToSystems(this.__folder_evidences_suggestion);
  }

  // convert __folder_evidences_suggestion to 'systems data' to mustache templates
  __convertFoldersToSystems() {
    var systems = {};

    _.forEach(this.__folder_evidences_suggestion, function(folder_evidence_suggestion) {
      var folderName = folder_evidence_suggestion.path;
      var evidences_suggestion = folder_evidence_suggestion.suggestions;

      var folder_base_regex        = /#\{app\.dir\}/gm;
      var folder_relative_regex    = /^\.(\/)?$|#\{app\.relative\}/;
      var folder_base_template     = '#{manifest.dir}';
      var folder_relative_template = ".$1";

      if (folderName !== this.__root_folder) {
        folder_base_template     += '/#{system.name}';
        folder_relative_template = './#{system.name}';
      }

      var folderTemplate = (path) => {
        // var before = _.clone(path);
        path = path.replace(folder_base_regex, folder_base_template);
        // var middle = _.clone(path);
        path = path.replace(folder_relative_regex, folder_relative_template);
        // console.log(before, '=>', middle, '=>', path);
        return path;
      };

      var replaceFolderTemplate = (elm) => {
        if (_.isString(elm)) {
          elm = elm.replace(folder_base_regex, folder_base_template);
        } else if (_.isObject(elm)) {
          var new_elm = {};
          _.map(elm, (data, key) => {
            var value = (_.isObject(data)) ? data.value : data;

            key   = (!_.isString(key)) ? key : folderTemplate(key);
            value = (!_.isString(value)) ? value : folderTemplate(value);

            if (_.isObject(data)) {
              data.value = value;
            } else {
              data = value;
            }
            new_elm[key] = data;
          });
          elm = new_elm;
        }
        return elm;
      };

      _.forEach(evidences_suggestion, function(evidence_suggestion) {
        var suggestion = evidence_suggestion.suggestionChoosen.suggestion;

        // create a new system
        var systemSuggestion = systems[suggestion.name] = suggestion;

        if (!evidence_suggestion.version) {
          this.ok('generator.foundWithoutVersion', {
            __type: evidence_suggestion.name,
            dir: folderName,
            systemName: suggestion.name,
            image: JSON.stringify(systemSuggestion.image)
          });
        } else {
          this.ok('generator.found', {
            __type: evidence_suggestion.name,
            dir: folderName,
            systemName: suggestion.name,
            image: JSON.stringify(systemSuggestion.image)
          });
        }

        // replace `#{app.dir}` by system template path
        systemSuggestion.workdir = replaceFolderTemplate(systemSuggestion.workdir);
        systemSuggestion.mounts  = replaceFolderTemplate(systemSuggestion.mounts);
        systemSuggestion.envs    = replaceFolderTemplate(systemSuggestion.envs);
      }, this);
    }, this);

    return systems;
  }

  judge(dir) {
    this.__root_folder = dir;
    return this._investigate(dir)
      .then(function () {
        this._analysis();
        this._veredict();
      }.bind(this));
  }
}
