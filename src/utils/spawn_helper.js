import { defer } from 'azk/utils/promises';
import { spawn } from 'child_process';
import { removeAllLinesByRegex } from 'azk/utils/regex_helper';
import { lazy_require } from 'azk';

var lazy = lazy_require({
  colors : ['azk/utils/colors'],
});

/**
 * Print output
 * @param  function uiOk            some output function
 * @param  number   verbose_level   if 0 do not print
 * @param  prefix   prefix          some prefix
 * @param  string   data            what to print
 */
export function printOutput(uiOk, verbose_level, prefix, data) {
  // exit if verbose is zero
  if (verbose_level === 0 || !data) {
    return;
  }

  // print 'prefix' before command
  var ui_prefix = prefix ? lazy.colors.gray(prefix) : '';
  var original_output = removeAllLinesByRegex(data.toString(), /^$/gm);
  var prefixed_output = original_output.replace(/^(.*)/gm, ui_prefix + lazy.colors.gray(' $1'));

  uiOk(prefixed_output);
}

/**
 * Executes a command against shell
 * @param  string     executable     executable path
 * @param  array      params_array   array with all parameters
 * @param  function   scanFunction   [otional] output function
 * @return Promisse                  { error_code: 0, message: 'COMMAND RESULT1\nCOMMAND RESULT2' }
 */
export function spawnAsync(executable, params_array, scanFunction) {
  return defer(function (resolve, reject) {
    var spawn_cmd = spawn(executable, params_array);
    var outputs = [];

    // print command
    scanFunction && scanFunction(`$> ${executable} ${lazy.colors.bold(params_array.join(' '))}`);

    spawn_cmd.stdout.on('data', function (data) {
      outputs.push(data);
      scanFunction && scanFunction(data);
    });

    spawn_cmd.stderr.on('data', function (data) {
      outputs.push(data);
      scanFunction && scanFunction(data);
    });

    spawn_cmd.on('close', function (code) {
      var result_object = {
        error_code: code,
        message: outputs.join('\n')
      };

      if (code !== 0) {
        reject(result_object);
      } else {
        resolve(result_object);
      }
    });
  });
}
