import { defer } from 'azk/utils/promises';
import { spawn } from 'child_process';
import { removeAllLinesByRegex } from 'azk/utils/regex_helper';
import { lazy_require } from 'azk';

var lazy = lazy_require({
  colors : ['azk/utils/colors'],
});

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

export function spawnAsync(opts) {
  return defer(function (resolve, reject) {
    var spawn_cmd = spawn(opts.executable, opts.params_array);
    var outputs = [];

    // print command
    var full_command = ('$> ' + opts.executable + ' ' + lazy.colors.bold(opts.params_array.join(' ')));
    printOutput(
      opts.uiOk,
      opts.verbose_level,
      opts.spawn_prefix,
      full_command
    );

    spawn_cmd.stdout.on('data', function (data) {
      outputs.push(data);

      // print output
      printOutput(
        opts.uiOk,
        opts.verbose_level,
        opts.spawn_prefix,
        data);
    });

    spawn_cmd.stderr.on('data', function (data) {
      outputs.push(data);

      // print output
      printOutput(
        opts.uiOk,
        opts.verbose_level,
        opts.spawn_prefix,
        data);
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
