import { _, config, log } from 'azk';
import { example_system } from 'azk/generator/rules';
import { UIProxy } from 'azk/cli/ui';
import { Court } from 'azk/generator/court';

var path = require('path');
var fs   = require('fs');
var Handlebars = require('handlebars');

var template = path.join(
  config('paths:azk_root'), 'shared', 'templates', 'Azkfile.mustache.js'
);

export class Generator extends UIProxy {
  constructor(ui) {
    super(ui);
    this.court = new Court(path.join(__dirname, "rules"), this);
  }

  get tpl() {
    if (!this._tpl)
      this._tpl = Handlebars.compile(fs.readFileSync(template).toString());
    return this._tpl;
  }

  findSystems(dir) {
    log.debug('court.judge(\'%s\')', dir);
    this.court.judge(dir);
    return this.court.systems_suggestions;
  }

  render(data, file) {
    data = _.extend({
      bins: [],
      azk: {
        default_domiapn: config('agent:balancer:host')
      },
    }, data);

    var renderedTemplate = this.tpl(data);
    // log.debug('renderedTemplate:', renderedTemplate);

    fs.writeFileSync(file, renderedTemplate);
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

function formatDomains(conditional, options) {
  if (_.isBoolean(conditional)) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

function mount(data) {
  if (_.isString(data)) { return json(data); }
  var options = _.reduce(data, (opts, value, key) => {
    if (key != 'value' && key != 'type') {
      opts[key] = value;
    }
    return opts;
  }, {});

  // args
  var args  = [];
  if (!_.isUndefined(data.value)) args.push(data.value);
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
Handlebars.registerHelper('formatDomains', formatDomains);

export { example_system };

