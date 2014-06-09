"use strict";
var __moduleName = "src/generator/index";
var $__1 = require('azk'),
    _ = $__1._,
    config = $__1.config;
var $__1 = require('azk/generator/rules'),
    Helpers = $__1.Helpers,
    example_system = $__1.example_system;
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var Handlebars = require('handlebars');
var template = path.join(config('paths:azk_root'), 'src', 'share', 'Azkfile.mustach.js');
var rules = {
  runtime: [],
  database: [],
  tasks: []
};
var generator = {
  example_system: example_system,
  __rules: rules,
  load: function(dir) {
    var $__0 = this;
    _.each(glob.sync(path.join(dir, '**/*.js')), (function(file) {
      var rule = require(file).default || {};
      if (_.isArray($__0.__rules[rule.type])) {
        rule.name = path.basename(file, ".js");
        $__0.__rules[rule.type].push(rule);
      }
    }));
  },
  rule: function(name) {
    return _.find(this.rules, (function(rule) {
      return rule.name == name;
    }));
  },
  get rules() {
    return $traceurRuntime.spread(this.__rules.runtime, this.__rules.database, this.__rules.tasks);
  },
  findSystems: function(dir) {
    return _.reduce(this.rules, (function(systems, rule) {
      return _.merge(systems, rule.findSystems(dir, systems) || {});
    }), {});
  },
  get tpl() {
    if (!this._tpl)
      this._tpl = Handlebars.compile(fs.readFileSync(template).toString());
    return this._tpl;
  },
  render: function(data, file) {
    data = _.extend({
      bins: [],
      azk: {default_domain: config('docker:default_domain')}
    }, data);
    fs.writeFileSync(file, this.tpl(data));
  }
};
function json(data) {
  return JSON.stringify(data || null, null, ' ').replace(/\n/g, '').replace(/^(\{|\[) /, '$1');
}
function hash_key(data) {
  return data.match(/-/) ? ("'" + data + "'") : data;
}
Handlebars.registerHelper('json', json);
Handlebars.registerHelper('hash_key', hash_key);
generator.load(path.join(__dirname, "rules"));
;
module.exports = {
  get generator() {
    return generator;
  },
  get example_system() {
    return example_system;
  },
  get rules() {
    return rules;
  },
  __esModule: true
};
//# sourceMappingURL=index.js.map