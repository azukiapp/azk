import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';

var glob = require('glob');
var path = require('path');

export class SugestionChooser extends UIProxy {
  constructor(sugestions_folder, ui) {
    super(ui);
    this.__sugestions = [];
    this.load(sugestions_folder);
  }

  get suggestions() {
    return this.__sugestions;
  }

  load(dir) {
    _.each(glob.sync(path.join(dir, '**/*.js')), (file) => {
      var Suggestion = require(file).Suggestion;
      if (Suggestion) {
        var suggestion = new Suggestion(this);
        this.__sugestions.push(suggestion);
      }
    });
  }

  suggest(ruleNamesList) {
    return _.find(this.suggestions, (suggestion) => {
      // try find same combinations of systems on ruleNamesList
      var diff = _.difference(suggestion.ruleNamesList, ruleNamesList);
      return (diff.length === 0);
    });
  }

}
