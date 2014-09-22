"use strict";
var __moduleName = "src/generator/index";
var $__2 = require('azk'),
    _ = $__2._,
    config = $__2.config,
    log = $__2.log;
var $__2 = require('azk/generator/rules'),
    Helpers = $__2.Helpers,
    example_system = $__2.example_system;
var UIProxy = require('azk/cli/ui').UIProxy;
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var Handlebars = require('handlebars');
var template = path.join(config('paths:azk_root'), 'src', 'share', 'Azkfile.mustache.js');
var Generator = function Generator(ui) {
  $traceurRuntime.superCall(this, $Generator.prototype, "constructor", [ui]);
  this.__rules = {
    runtime: [],
    database: [],
    tasks: []
  };
  this.load(path.join(__dirname, "rules"));
};
var $Generator = Generator;
($traceurRuntime.createClass)(Generator, {
  get rules() {
    return $traceurRuntime.spread(this.__rules.runtime, this.__rules.database, this.__rules.tasks);
  },
  get tpl() {
    if (!this._tpl)
      this._tpl = Handlebars.compile(fs.readFileSync(template).toString());
    return this._tpl;
  },
  load: function(dir) {
    var $__0 = this;
    _.each(glob.sync(path.join(dir, '**/*.js')), (function(file) {
      var Rule = require(file).Rule;
      if (Rule) {
        var rule = new Rule($__0);
        if (_.isArray($__0.__rules[rule.type])) {
          rule.name = path.basename(file, ".js");
          $__0.__rules[rule.type].push(rule);
        }
      }
    }));
  },
  rule: function(name) {
    return _.find(this.rules, (function(rule) {
      return rule.name == name;
    }));
  },
  findSystems: function(dir) {
    return _.reduce(this.rules, (function(systems, rule) {
      return _.merge(systems, rule.run(dir, systems) || {});
    }), {});
  },
  render: function(data, file) {
    data = _.extend({
      bins: [],
      azk: {default_domain: config('agent:balancer:host')}
    }, data);
    fs.writeFileSync(file, this.tpl(data));
  }
}, {}, UIProxy);
function json(data) {
  return JSON.stringify(data || null, null, ' ').replace(/\n/g, '').replace(/^(\{|\[) /, '$1');
}
function hash_key(data) {
  return (data || "").match(/^[\w|_]*$/) ? data : ("'" + data + "'");
}
function mount(data) {
  if (_.isString(data)) {
    return json(data);
  }
  var type = data.type;
  var options = _.reduce(data, (function(opts, value, key) {
    if (key != 'value' && key != 'type') {
      opts[key] = value;
    }
    return opts;
  }), {});
  var args = [];
  if (!_.isUndefined(data.value)) {
    args.push(data.value);
  }
  ;
  if (!_.isEmpty(options))
    args.push(options);
  args = _.map(args, (function(arg) {
    return json(arg);
  }));
  switch (data.type) {
    default:
      return (data.type + "(" + args.join(', ') + ")");
  }
}
Handlebars.registerHelper('json', json);
Handlebars.registerHelper('hash_key', hash_key);
Handlebars.registerHelper('mount', mount);
;
module.exports = {
  get Generator() {
    return Generator;
  },
  get example_system() {
    return example_system;
  },
  __esModule: true
};
//# sourceMappingURL=index.js.map