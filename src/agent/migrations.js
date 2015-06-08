import { lazy_require, config, fsAsync } from 'azk';
import { publish } from 'azk/utils/postal';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  meta : ['azk'],
  VM   : ['azk/agent/vm'],
});

var Migrations = {
  // IMPORTANT: Do not change the order of this array, never!
  migrations: [
    // update domain and namespace
    function(configure) {
      return async(this, function* () {
        // Notify about the upgrading
        configure.info('configure.migrations.changing_domain', { origin, target });

        // Move resolver files
        var origin = "/etc/resolver/azk.dev";
        var target = config('agent:balancer:file_dns');

        if ((yield fsAsync.exists(origin)) && !(yield fsAsync.exists(target))) {
          yield configure.execShWithSudo('mv_resolver', (sudo_path) => {
            // Moving resolver files and log
            configure.info('configure.migrations.moving_resolver', { origin, target });
            var result = `
              echo "" &&
              set -x &&
              ${sudo_path} mv ${origin} ${target} &&
              set +x &&
              echo ""
            `;
            return result;
          });
        }

        // Remove old machine
        if (config('agent:requires_vm')) {
          var old_name = "azk-vm-azk.dev";
          var new_name = config("agent:vm:name");
          configure.info('configure.migrations.renaming_vm', { old_name, new_name });
          yield lazy.VM.rename(old_name, new_name);
        }

        return true;
      });
    },
  ],

  run(configure) {
    return async(this, function* () {
      // Meta options
      var meta_tag  = "last_migration";

      // Initialize meta
      var last_run  = parseInt(lazy.meta.getOrSet(meta_tag, -1));
      var be_run    = this.migrations.slice(last_run + 1);

      // Azk agent was set up at least once?
      if (yield fsAsync.exists(lazy.meta.cache_dir) && be_run.length > 0) {
        // Warns on the run of migrations
        publish("agent.migrations.run.status", { type: "status", keys: "configure.migrations.alert"});

        // Run migrations
        for (var i = 0; i < be_run.length; i++) {
          yield be_run[i].apply(this.migrations, [configure]);
          last_run++;
          lazy.meta.set(meta_tag, last_run);
        }
      } else {
        // Saves all migrations were performed
        lazy.meta.set(meta_tag, this.migrations.length - 1);
      }

      return {};
    });
  }
};

export { Migrations };
