var azk = require('../azk');
var App = require('../app');

var helpers = module.exports = {};

helpers.require_app = function(dir) {
  var app = new App(process.cwd());

  if (!app.file) {
    console.error(
      azk.t("app.manifest.not_found", azk.cst.MANIFEST)
    );
    process.exit(1);
  }

  return app;
}

helpers.image_not_found = function(image) {
  console.error(
    azk.t("app.image.not_provision", image)
  );
  process.exit(2);
}

