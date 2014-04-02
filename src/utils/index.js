
export class Utils {
  static cd(target, func) {
    var old    = process.cwd();
    process.chdir(target);
    var result = func();
    process.chdir(old);

    return result;
  }

  static resolve(path) {
    return cd(path, function() {
      return process.cwd();
    });
  }
};

export default Utils;
