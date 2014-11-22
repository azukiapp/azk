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

## More generators
- from issue #46: Adding more generators
- https://github.com/azukiapp/azk/pull/149

Investigates directories looking for files that can define the systems. Suggests `docker images` that match systems requirements for each folder.

-----------
## Main Flow

##### Cmd Init():
```js
    var systemsData = generator.findSystems(cwd);
```

##### Generator findSystems(dir):
```js
    this.court.judge(dir);
    return this.court.systems_suggestions;
```

##### Court judge(dir):
```js
  judge(dir) {
    this.__root_folder = dir;
    this._investigate(dir);
    this._analysis();
    this._veredict();
  }
```

##### Cmd Init():
```js
    generator.render({ systems: systemsData }, file);
```

-----------
## Court judge(dir) details

### _investigate(dir);
 - For each rule receives `relevantsFiles` to search
 - Get relevant files with its `contents`
 - For each detected file executes `rule.getEvidence()`

##### __evidences

```js
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
```


### _analysis
  - check if the `evidence` has a `replaces` array
  - `_replacesEvidences`(): replaces other evidences on the same path (system)

##### __evidences_by_folder
```js
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
```


### _veredict()
  - fills `__folder_evidences_suggestion` with found evidences grouping in folders(systems)
  - set `system name`
  - set `database dependencies` for `[framework,runtime]` suggestions
  - finally converts `__folder_evidences_suggestion` to  `__systems_suggestions`
    for the Azkfile `mustache template`


##### folders_evidence_suggestion
```js
    folders_evidence_suggestion:
    [

      { fullpath: '/tmp/azk-test-28160o76dgi8/project/Gemfile',
        ruleType: 'database',
        name: 'mysql',
        ruleName: 'mysql56',
        suggestionChoosen:
         { parent: [Object],
           name: 'mysql',
           ruleNamesList: [Object],
           suggestion: [Object] }
      }

      { fullpath: '/tmp/azk-test-28160o76dgi8/project/Gemfile',
        ruleType: 'framework',
        name: 'rails',
        ruleName: 'rails41',
        replaces: [ 'ruby', 'node' ],
        version: '4.1.6',
        suggestionChoosen:
         { parent: [Object],
           name: 'rails',
           ruleNamesList: [Object],
           suggestion: [Object] }
      }
    ]
```

##### __systems_suggestions

```js
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

```

*/
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
    return [
      ...this.__rules.runtime,
      ...this.__rules.database,
      ...this.__rules.framework,
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

        if( evidence_suggestion.ruleType === 'runtime'  ||
            evidence_suggestion.ruleType === 'framework'  ) {
          systemName = folderBasename;
        }
        else if( evidence_suggestion.ruleType === 'database') {
          systemName = evidence_suggestion.name;
        }
        var suggestion     = evidence_suggestion.suggestionChoosen.suggestion;
        suggestion.name = systemName;
      }, this);

      // get all database suggestions
      var databaseSuggestions = _.filter(evidences_suggestion, function(evidence_suggestion) {
        return evidence_suggestion.ruleType === 'database';
      });

      // get all [framework,runtime] suggestions
      var runtimeFrameWorkSuggestions = _.filter(evidences_suggestion, function(evidence_suggestion) {
        return evidence_suggestion.ruleType === 'runtime' ||
               evidence_suggestion.ruleType === 'framework';
      });

      // include database dependency on [framework,runtime] suggestions
      if(databaseSuggestions.length > 0 && runtimeFrameWorkSuggestions.length > 0) {
        _.forEach(runtimeFrameWorkSuggestions, function(system) {
          var runtimeFrameWorkSuggestions = system.suggestionChoosen.suggestion;
          var firstDatabaseName = databaseSuggestions[0].suggestionChoosen.suggestion.name;
          runtimeFrameWorkSuggestions.depends = [firstDatabaseName];
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
      var folderBasename = this._folderBasename(folderName);
      var evidences_suggestion = folder_evidence_suggestion.suggestions;

      _.forEach(evidences_suggestion, function(evidence_suggestion) {
        var suggestion = evidence_suggestion.suggestionChoosen.suggestion;

        // create a new system
        systems[suggestion.name] = suggestion;
        this.ok('generator.found', { __type: evidence_suggestion.name, dir: folderName});

        // when in a sub-folder change `workdir`
        if(folderName !== this.__root_folder && systems[suggestion.name].workdir) {
          systems[suggestion.name].workdir = path.join(systems[suggestion.name].workdir, folderBasename);
        }

        // when in a sub-folder change default `path('.') mounts` to the subfolder
        var default_mount_path = _.findKey(systems[suggestion.name].mounts, function(mount) {
          return (mount.type === 'path' && mount.value === '.');
        });

        if( default_mount_path &&
            folderName !== this.__root_folder &&
            systems[suggestion.name].mounts) {

          var keyBackup = systems[suggestion.name].mounts[default_mount_path];
          keyBackup.value = './' + folderBasename;
          delete systems[suggestion.name].mounts[default_mount_path];
          var newPathKey = default_mount_path.replace(/^(\/azk\/#\{manifest\.dir\})$/gm, '$1/' + folderBasename);
          systems[suggestion.name].mounts[newPathKey] = keyBackup;
        }

      }, this);
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
