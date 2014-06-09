"use strict";
var __moduleName = "src/generator/rules/ruby";
var path = require('path');
var fs = require('fs');
var node = {};
var box = {
  box: "azukiapp/ruby-box#stable",
  cmd: "bundle exec rackup -p $PORT config.ru",
  envs: [{
    key: "RUBY_ENV",
    value: "dev"
  }]
};
module.exports = {detect: function(dir) {
    var file = path.join(dir, "Gemfile");
    if (fs.existsSync(file)) {
      return box;
    }
  }};
//# sourceMappingURL=ruby.js.map