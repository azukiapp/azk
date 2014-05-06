import { _, config } from 'azk';

var glob = require('glob');
var path = require('path');
var fs   = require('fs');
var Handlebars = require('handlebars');

var template = path.join(
  config('azk_root'), 'src', 'share', 'Azkfile.mustach.js'
);

var files = glob.sync("roles/*.js", { cwd: __dirname });
var rules = _.map(files, (role) => {
  return require(path.join(__dirname, role));
});

var generator = {
  inspect(dir) {
    var result = null;

    _.some(rules, (rule) => {
      return result = rule.detect(dir);
    });

    return result;
  },

  get tpl() {
    if (!this._tpl)
      this._tpl = Handlebars.compile(fs.readFileSync(template).toString());
    return this._tpl;
  },

  render(data, file) {
    fs.writeFileSync(file, this.tpl(data));
  }
}

Handlebars.registerHelper('json', (data) => {
  return JSON.stringify(data || null, null, ' ')
    .replace(/\n/g, '')
    .replace(/^(\{|\[) /, '$1');
});

export { generator }

