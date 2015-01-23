import { _, Q, async, lazy_require } from 'azk';
import { config } from 'azk';
var qfs = require('q-io/fs');

lazy_require(this, {
  Meta : ['azk/manifest/meta'],
  VM   : ['azk/agent/vm'],
});

var Migrations = {
  // IMPORTANT: Do not change the order of this array, never!
  migrations: [
    // update domain and namespace
    function(configure) {
      return async(this, function* (notify) {
        // Notify about the upgrading
        configure.info('configure.migrations.changing_domain', { origin, target });

        // Move resolver files
        var origin = "/etc/resolver/azk.dev";
        var target = config('agent:balancer:file_dns');

        if ((yield qfs.exists(origin)) && !(yield qfs.exists(target))) {
          yield configure.execShWithSudo('mv_resolver', (sudo_path) => {
            // Moving resolver files and notify
            configure.info('configure.migrations.moving_resolver', { origin, target });
            return `
              echo "" &&
              set -x &&
              ${sudo_path} mv ${origin} ${target} &&
              set +x &&
              echo ""
            `;
          });
        }

        // Remove old machine
        if (config('agent:requires_vm')) {
          var old_name = "azk-vm-azk.dev";
          var new_name = config("agent:vm:name");
          configure.info('configure.migrations.renaming_vm', { old_name, new_name });
          yield VM.rename(old_name, new_name);
        }

        return true;
      });
    },
  ],

  run(configure) {
    return async(this, function* (notify) {
      // Meta options
      var meta_tag  = "last_migration";
      var cache_dir = config('paths:azk_meta');

      // Initialize meta
      var meta      = new Meta({ cache_dir });
      var last_run  = parseInt(meta.getOrSet(meta_tag, -1));
      var be_run    = this.migrations.slice(last_run + 1);

      // Azk agent was set up at least once?
      if (yield qfs.exists(cache_dir) && be_run.length > 0) {
        // Warns on the run of migrations
        notify({ type: "status", keys: "configure.migrations.alert"});

        // Run migrations
        for(var i = 0; i < be_run.length; i++) {
          yield be_run[i].apply(this.migrations, [configure]);
          last_run++
          meta.set(meta_tag, last_run);
        }
      } else {
        // Saves all migrations were performed
        meta.set(meta_tag, this.migrations.length - 1);
      }

      return {};
    });
  }
}

export { Migrations }
