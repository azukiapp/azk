import { _, config } from 'azk';
import { Helpers, example_system } from 'azk/generator/rules';

var glob = require('glob');
var path = require('path');
var fs   = require('fs');
var Handlebars = require('handlebars');

var template = path.join(
  config('paths:azk_root'), 'src', 'share', 'Azkfile.mustach.js'
);

var rules = {
  runtime  : [],
  database : [],
  tasks    : [],
};

var generator = {
  example_system,
  __rules: rules,

  load(dir) {
    _.each(glob.sync(path.join(dir, '**/*.js')), (file) => {
      var rule  = require(file).default || {};
      if (_.isArray(this.__rules[rule.type])) {
        rule.name = path.basename(file, ".js");
        this.__rules[rule.type].push(rule);
      }
    });
  },

  rule(name) {
    return _.find(this.rules, (rule) => { return rule.name == name });
  },

  get rules() {
    return [...this.__rules.runtime, ...this.__rules.database, ...this.__rules.tasks];
  },

  findSystems(dir) {
    var systems = [];

    return _.reduce(this.rules, (systems, rule) => {
      return systems.concat(rule.findSystems(dir, systems) || []);
    }, []);
  },

  get tpl() {
    if (!this._tpl)
      this._tpl = Handlebars.compile(fs.readFileSync(template).toString());
    return this._tpl;
  },

  render(data, file) {
    data = _.extend({
      bins: [],
    }, data);
    fs.writeFileSync(file, this.tpl(data));
  }
}

function json(data) {
  return JSON.stringify(data || null, null, ' ')
    .replace(/\n/g, '')
    .replace(/^(\{|\[) /, '$1');
}

Handlebars.registerHelper('json', json);

// Load default rules
generator.load(path.join(__dirname, "rules"));

export { generator, example_system, rules };

