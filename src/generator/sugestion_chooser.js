import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';

var glob = require('glob');
var path = require('path');

export class SugestionChooser extends UIProxy {
  constructor(ui, sugestions_folder) {
    super(ui);
    this.__suggestions = [];
    this.load(sugestions_folder);
  }

  get suggestions() {
    return this.__suggestions;
  }

  load(dir) {
    let suggestions = glob.sync(path.join(dir, '**/*.js'));
    this.__suggestions = _.map(suggestions, (file) => {
      return new (require(file).Suggestion)();
    });
  }

  suggest(evidences) {
    return _.map(evidences, (evidence) => {
      var suggestionChoosen = _.find(this.suggestions, (suggestion) => {
        if (suggestion.analytics) {
          return suggestion.examine(evidence, evidences);
        } else {
          var list = suggestion.ruleNamesList || [];
          return list.indexOf(evidence.ruleName) > -1;
        }
      });

      if (suggestionChoosen) {
        evidence.suggestionChoosen            = _.clone(suggestionChoosen);
        evidence.suggestionChoosen.suggestion = _.cloneDeep(suggestionChoosen.suggestion);
      }
      return evidence;
    });
  }
}
