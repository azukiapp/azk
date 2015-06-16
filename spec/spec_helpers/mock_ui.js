import { _ } from 'azk';
import { promiseResolve } from 'azk/utils/promises';
import { UI as OriginalUI } from 'azk/cli/ui';

export function extend(h) {
  h.mockUI = function(func, outputs, extra) {
    // Mock UI
    var UI    = _.clone(OriginalUI);
    UI.dir    = (...args) => outputs.push(...args);
    UI.stdout = () => {
      return {
        write(data) {
          data = (data || '').toString();
          outputs.push(data.replace(/(.*)\n/, "$1"));
        }
      };
    };

    UI.stderr = UI.stdout;

    UI.execSh = (cmd) => {
      UI.dir(cmd);
      return promiseResolve(0);
    };

    func(() => {
      while (outputs.length > 0) {
        outputs.pop();
      }

      if (extra) {
        extra.call(this);
      }
    });

    return UI;
  };
}
