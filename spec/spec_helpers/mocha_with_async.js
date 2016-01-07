import { async } from 'azk/utils/promises';

export function extend() {
  let fn = (...args) => async(...args);
  require('azk-dev/lib/generators')(fn);
}
