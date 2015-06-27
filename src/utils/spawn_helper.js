import { defer } from 'azk/utils/promises';
import { spawn } from 'child_process';

var SpawnHelper = {
  __esModule: true,

  spawnAsync(executable, params_array, verbose_level) {
    return defer(function (resolve, reject) {
      var spawn_cmd = spawn(executable, params_array);
      var outputs = [];

      spawn_cmd.stdout.on('data', function (data) {
        outputs.push(data);
        if (verbose_level >= 1) {
          console.log(data.toString());
        }
      });

      spawn_cmd.stderr.on('data', function (data) {
        outputs.push(data);
        if (verbose_level >= 1) {
          console.log(data.toString());
        }
      });

      spawn_cmd.on('close', function (code) {
        if (code !== 0) {
          reject({
            error_code: code,
            message: outputs.join('\n')
          });
        } else {
          resolve(code);
        }
      });
    });
  },

};

module.exports = SpawnHelper;
