import { _, log } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { SugestionChooser } from 'azk/generator/sugestion_chooser';

var glob = require('glob');
var path = require('path');
var fs   = require('fs');

/*
-------------------
  Court
-------------------
  Investigates directories looking for files that can define the
  systems. Suggests Docker images that fills the combination of
  systems on each folder.
-------------------

  judge()
    - _investigate(dir);
    - _replacesEvidences();
    - _veredict();

# 1) _investigate(dir);
  - for each rule receives relevantsFiles to search
  - get relevant files with its contents
  - for each detected file executes rule.getEvidence()
  returns -> __evidences
     ---------
  :: i.e.
  [
   {
      fullpath:'/tmp/azk-test-129227oubphs/api/package.json',
      ruleType:'runtime',
      name:'node',
      ruleName:'node010',
      version:'0.4.1'
   },

   {
      fullpath:'/tmp/azk-test-129227oubphs/front/Gemfile',
      ruleType:'runtime',
      name:'ruby',
      ruleName:'ruby2',
      version:null
   },
   {
      fullpath:'/tmp/azk-test-129227oubphs/front/Gemfile',
      ruleType:'framework',
      name:'rails',
      ruleName:'rails41',
      replaces:[
         'ruby',
         'node'
      ],
      version:'4.1.6'
   }
  ]

----------------------------------------------------------------
# 2) _analysis
  - check if the evidence has a 'replaces' array
  - _replacesEvidences(): replaces other evidences on the same path (system)
  returns -> __evidences_by_folder
     ---------
  :: i.e.
  {
     "/tmp/azk-test-71169z8zhz4/api": [
        {
           "fullpath": "/tmp/azk-test-71169z8zhz4/api/package.json",
           "ruleType": "runtime",
           "name": "node",
           "ruleName": "node010",
           "version": "0.4.1"
        }
     ],
     "/tmp/azk-test-71169z8zhz4/front": [
        {
           "fullpath": "/tmp/azk-test-71169z8zhz4/front/Gemfile",
           "ruleType": "framework",
           "name": "rails",
           "ruleName": "rails41",
           "replaces": [
              "ruby",
              "node"
           ],
           "version": "4.1.6"
        }
     ]
  }

----------------------------------------------------------------
# 3) _veredict()
  - fills __folders_suggestions with found evidences grouping in folders(systems)
  - finally converts __folders_suggestions to  __systems_suggestions
    for the Azkfile mustache template
     ---------
  :: i.e.
    --------------------------------------------------------
    court.folders_suggestions:
    [
      {
        path              : '/tmp/azk-test-1632gcdoc1c/api',

        evidence          : [ [Object] ],

        suggestionChoosen : {
          parent       : [Object],
          name         : 'node 0.10.x',
          ruleNamesList: ['node010'],
          suggestion   : [Object]
        }
      }
      ...
    ]

    --------------------------------------------------------
    __systems_suggestions
    { api:
     { __type: 'node.js',
       name: 'example',
       depends: [],
       image: 'node:0.10',
       workdir: '/azk/#{manifest.dir}/api/api',
       balancer: true,
       command: 'npm start',
       mounts: { '/azk/#{manifest.dir}': [Object] },
       envs: { NODE_ENV: 'dev' },
       provision: [ 'npm install' ],
       http: true,
       scalable: { default: 2 } },
    front:
     { __type: 'rails 4.1',
       name: 'example',
       depends: [],
       image: 'rails:4.1',
       workdir: '/azk/#{manifest.dir}/front/front',
       balancer: true,
       command: 'bundle exec rackup config.ru --port $HTTP_PORT',
       mounts: { '/azk/#{manifest.dir}': [Object], '/azk/bundler': [Object] },
       envs: { RAILS_ENV: 'development', BUNDLE_APP_CONFIG: '/azk/bundler' },
       provision: [ 'bundle install --path /azk/bundler' ],
       http: true,
       scalable: { default: 2 },
       shell: '/bin/bash' } }

*/
export class Court extends UIProxy {
  constructor(rules_folder, ui) {
    super(ui);

    this.sugestionChooser = new SugestionChooser(path.join(__dirname, "suggestions"), this);

    this.__rules = {
      runtime   : [],
      framework : [],
      database  : [],
      worker    : [],
      task      : [],
    };

    this.__evidences = [];
    this.__evidences_by_folder = [];
    this.__folders_suggestions = [];
    this.__systems_suggestions = [];

    // Load default rules
    this.load(rules_folder);
    log.debug('Court :: rules loaded:', this.rules.length);
  }

  get rules() {
    return [
              ...this.__rules.runtime,
              ...this.__rules.framework,
              ...this.__rules.database,
              ...this.__rules.worker,
              ...this.__rules.task
           ];
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
    var patterns = [
      path.join(dir, file_name),
      path.join(dir, '*', file_name),
    ];

    var files = _.reduce(patterns, (files, pattern) => {
      return files.concat(glob.sync(pattern));
    }, []);

    return _.map(files, (file) => { return file; });
  }

  _investigate(dir) {
    var evidences = [],
        filesToSearch = [],
        relevantFiles = [],
        projectFiles = [];

    // rules's files to search
    filesToSearch = _.map(this.rules, (rule) => {
      return rule.relevantsFiles();
    });
    filesToSearch = _.flatten(filesToSearch);
    log.debug('Court :: filesToSearch:', filesToSearch);

    // relevant files in the project folders
    projectFiles = this._relevantProjectFiles(
      dir, filesToSearch);

    projectFiles = _.flatten(projectFiles);
    projectFiles = _.union(projectFiles);
    log.debug('Court :: projectFiles:', JSON.stringify(projectFiles, ' ', 3));

    // relevant files with its contents
    relevantFiles = _.map(projectFiles, (fullpath) => {
      return {
        fullpath: fullpath,
        content: fs.readFileSync(fullpath).toString()
      };
    });

    // get evidence for each rule
    _.forEach(relevantFiles, function(file) {
        var basename = path.basename(file.fullpath);
        _.forEach(this.rules, function(rule) {
          var isRelevantFile = _.contains(rule.relevantsFiles(), basename);
          if (isRelevantFile) {
            var evidence = rule.getEvidence(file.fullpath, file.content);
            if(evidence) {
              evidences.push(evidence);
            }
          }
        });
    }, this);
    log.debug('Court :: evidences:', JSON.stringify(evidences, ' ', 3) );

    this.__evidences = evidences;
  }

  _replacesEvidences() {
    var groupedByDir = this._getEvidencesByFolder();

    _.forEach(groupedByDir, function(dir) {
      _.forEach(dir, function(evidence) {
        // this evidence will replace
        if (_.has(evidence, 'replaces')) {
          // try find dependency to remove
          _.remove(dir, function(dirItem) {
            var willRemove = _.contains(evidence.replaces, dirItem.name);
            if(willRemove){
              log.debug('Court :: _replacesEvidences: willRemove => ', dirItem);
            }
            return willRemove;
          });
        }
      });
    });

    this.__evidences_by_folder = groupedByDir;
  }

  _getEvidencesByFolder() {
    return _.groupBy(this.__evidences, function(evidence) {
      return path.dirname(evidence.fullpath);
    });
  }

  _getSystemNameByFolder(fullpath) {
    return path.basename(fullpath).replace(/_/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  }

  _analysis() {
    this._replacesEvidences();
  }

  _veredict() {
    this.__folders_suggestions = [];
    _.forEach(this.__evidences_by_folder, function(value, key) {
      var ruleNames = _.map(value, 'ruleName');
      var suggestion = this.sugestionChooser.suggest(ruleNames);
      this.__folders_suggestions.push({
        path: key,
        evidence: value,
        suggestionChoosen: suggestion,
      });
    }, this);

    this.__systems_suggestions = this.__convertFoldersToSystems(this.__folders_suggestions);
  }

  // convert __folders_suggestions to 'systems data' to mustache templates
  __convertFoldersToSystems() {
    var systems = {};
    var root_basename = path.basename(this.__root_folder);

    _.forEach(this.__folders_suggestions, function(folderSuggestion) {
      var name = this._getSystemNameByFolder(folderSuggestion.path);
      var system_basename = path.basename(folderSuggestion.path);
      if(folderSuggestion.suggestionChoosen) {
        systems[name] = folderSuggestion.suggestionChoosen.suggestion;

        // change sub folder workdir
        if(system_basename !== root_basename) {
          systems[name].workdir = path.join(systems[name].workdir, system_basename);
        }
      }
    }, this);
    return systems;
  }

  judge(dir) {
    this.__root_folder = dir;

    this._investigate(dir);
    this._analysis();
    this._veredict();
  }

}
