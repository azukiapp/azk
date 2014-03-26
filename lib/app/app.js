var uuid   = require('node-uuid');
var azk    = require('../azk');
var parent = require('parentpath').sync;
var path   = require('path');
var fs     = require('fs');
var Box    = require('./box');
var utils  = require('../utils');

JSON.minify = JSON.minify || require("node-json-minify");
var Q = azk.Q;
var _ = azk._;

function parse_env(file, env) {
  var content = fs.readFileSync(file).toString();
  _.each(content.split('\n'), function(entry) {
    entry = entry.split('=');
    env[entry[0]] = entry[1];
  });
}

export class App {
  constructor(cwd, env) {
    var manifest = App.find_manifest(cwd);
    if (manifest) {
      try {
        var content = JSON.parse(
          JSON.minify(fs.readFileSync(manifest).toString())
        );
      } catch (e) {
        //var file = path.relative(cwd, manifest);
        throw new azk.errors.InvalidManifestFormatError(manifest, e);
      }

      var self = this;
      var repository = "azk/apps/" + content.id;

      self.id = content.id;
      self.file  = manifest;
      self.cwd   = path.dirname(manifest);

      self.type = "app";
      self.repository = repository;
      self.image = repository + ':latest';
      self.path  = path.dirname(manifest);

      // TODO: Load default
      self.envs = content.envs || {};
      self.env  = _.clone(self.envs[env || "dev"] || { });
      self.env.env = self.env.env || {}

      // Configure hosts
      var alias  = _.clone(self.env.alias || []);
      var domain = azk.cst.DEFAULT_DOMAIN;
      alias.unshift(self.id + "." + domain);
      if (self.env.host) { alias.unshift(self.env.host + "." + domain); }
      self.env.alias = alias;

      // Logs
      var default_log = path.join(azk.cst.DEFAULT_LOG_PATH, content.id);
      self.log = {
        path: path.resolve(self.cwd, self.env.log_dir || default_log )
      };

      // File .env
      var e_file = path.join(path.dirname(manifest), ".env");
      if (fs.existsSync(e_file)) {
        parse_env(e_file, self.env.env);
      }

      // Services
      self.services = content.services;

      self.content = content;
      utils.cd(self.path, function() {
        self.from = new Box(content.box);
      });

      self.steps = content.build || [];
    }
  }

  provision(opts, stdout) {
    opts = _.extend({
      force: false,
      cache: true,
    }, opts || {});

    if (!provision_box)
      provision_box = require('./provision_box');

    return provision_box(this, opts, stdout);
  }

  static find_manifest(target) {
    var dir = azk.utils.cd(target, function() {
      return parent(azk.cst.MANIFEST);
    });
    return dir ? path.join(dir, azk.cst.MANIFEST) : null;
  }

  static new_id() {
    return uuid.v1().replace(/-/g, "");
  }
}
