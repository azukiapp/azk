import { _, config, log } from 'azk';
import { Helpers, example_system } from 'azk/generator/rules';
import { UIProxy } from 'azk/cli/ui';

var glob = require('glob');
var path = require('path');
var fs   = require('fs');
var Handlebars = require('handlebars');

var template = path.join(
  config('paths:azk_root'), 'src', 'share', 'Azkfile.mustache.js'
);

export class Generator extends UIProxy {
  constructor(ui) {
    super(ui);

    this.__rules = {
      runtime  : [],
      database : [],
      tasks    : [],
    }

    // Load default rules
    this.load(path.join(__dirname, "rules"));
  }

  get rules() {
    return [...this.__rules.runtime, ...this.__rules.database, ...this.__rules.tasks];
  }

  get tpl() {
    if (!this._tpl)
      this._tpl = Handlebars.compile(fs.readFileSync(template).toString());
    return this._tpl;
  }

  load(dir) {
    _.each(glob.sync(path.join(dir, '**/*.js')), (file) => {
      var Rule = require(file).Rule;
      if (Rule) {
        var rule = new Rule(this);
        if (_.isArray(this.__rules[rule.type])) {
          rule.name = path.basename(file, ".js");
          this.__rules[rule.type].push(rule);
        }
      }
    });
  }

  rule(name) {
    return _.find(this.rules, (rule) => { return rule.name == name });
  }

  findSystems(dir) {
    return _.reduce(this.rules, (systems, rule) => {
      return _.merge(systems, rule.run(dir, systems) || {});
    }, {});
  }

  render(data, file) {
    data = _.extend({
      bins: [],
      azk: {
        default_domain: config('agent:balancer:host')
      },
    }, data);
    fs.writeFileSync(file, this.tpl(data));
  }
}

function json(data) {
  return JSON.stringify(data || null, null, ' ')
    .replace(/\n/g, '')
    .replace(/^(\{|\[) /, '$1');
}

function hash_key(data) {
  return (data || "").match(/^[\w|_]*$/) ? data : `'${data}'`;
}

function mount(data) {
  if (_.isString(data)) { return json(data); }
  var type    = data.type;
  var options = _.reduce(data, (opts, value, key) => {
    if (key != 'value' && key != 'type') {
      opts[key] = value;
    }
    return opts;
  }, {});

  // args
  var args  = [];
  if (!_.isUndefined(data.value)) { args.push(data.value) };
  if (!_.isEmpty(options)) args.push(options);
  args = _.map(args, (arg) => { return json(arg); });

  switch(data.type) {
    default:
      return `${data.type}(${args.join(', ')})`;
  }
}

Handlebars.registerHelper('json', json);
Handlebars.registerHelper('hash_key', hash_key);
Handlebars.registerHelper('mount', mount);

export { example_system };

