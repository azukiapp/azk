var path = require('path');
var fs   = require('fs');

var node = {}
var box  = {
  box: "azukiapp/node-box#stable"
}

module.exports = {
  detect: function(dir) {
    var file = path.join(dir, "package.json")
    if (fs.existsSync(file)) {
      return box;
    }
  }
}

