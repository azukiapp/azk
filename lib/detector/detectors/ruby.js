var path = require('path');
var fs   = require('fs');

var node = {}
var box  = {
  box: "azukiapp/ruby-box#stable"
}

module.exports = {
  detect: function(dir) {
    var file = path.join(dir, "Gemfile")
    if (fs.existsSync(file)) {
      return box;
    }
  }
}

