import { async, promisifyAll } from 'azk/utils/promises';
var fs = require('fs-extra');

promisifyAll(fs);

var FileAsync = {

  /**
   * stat :: fs.stat
   * @param  {string} full_path     file's fullpath to get stat
   * @return {object} fsStat        stat functions: isFile, isDirectory, isBlockDevice, isCharacterDevice, isSymbolicLink, isFIFO, isSocket
   *
   * https://github.com/petkaantonov/bluebird/issues/5#issuecomment-25747355
  */
  exists: function (full_path) {
    return async(function* () {
      try {
        yield FileAsync.stat(full_path);
        return true;
      } catch (err) {
        if (err.code === 'ENOENT') {
          return false;
        }
        throw err;
      }
    });
  },

  /**
   * glob :: glob
  */
  glob: require('glob'),

  // other fs & fs-extra methods
  appendFile:        (...args) => { return fs.appendFileAsync(...args); },
  chmod:             (...args) => { return fs.chmodAsync(...args); },
  chown:             (...args) => { return fs.chownAsync(...args); },
  close:             (...args) => { return fs.closeAsync(...args); },
  copy:              (...args) => { return fs.copyAsync(...args); },
  createFile:        (...args) => { return fs.createFileAsync(...args); },
  createReadStream:  (...args) => { return fs.createReadStreamAsync(...args); },
  createWriteStream: (...args) => { return fs.createWriteStreamAsync(...args); },
  delete:            (...args) => { return fs.deleteAsync(...args); },
  ensureDir:         (...args) => { return fs.ensureDirAsync(...args); },
  ensureFile:        (...args) => { return fs.ensureFileAsync(...args); },
  fchmod:            (...args) => { return fs.fchmodAsync(...args); },
  fchown:            (...args) => { return fs.fchownAsync(...args); },
  fdatasync:         (...args) => { return fs.fdatasyncAsync(...args); },
  fstat:             (...args) => { return fs.fstatAsync(...args); },
  fsync:             (...args) => { return fs.fsyncAsync(...args); },
  ftruncate:         (...args) => { return fs.ftruncateAsync(...args); },
  futimes:           (...args) => { return fs.futimesAsync(...args); },
  lchmod:            (...args) => { return fs.lchmodAsync(...args); },
  lchown:            (...args) => { return fs.lchownAsync(...args); },
  link:              (...args) => { return fs.linkAsync(...args); },
  lstat:             (...args) => { return fs.lstatAsync(...args); },
  lutimes:           (...args) => { return fs.lutimesAsync(...args); },
  mkdir:             (...args) => { return fs.mkdirAsync(...args); },
  mkdirp:            (...args) => { return fs.mkdirpAsync(...args); },
  mkdirs:            (...args) => { return fs.mkdirsAsync(...args); },
  move:              (...args) => { return fs.moveAsync(...args); },
  open:              (...args) => { return fs.openAsync(...args); },
  outputFile:        (...args) => { return fs.outputFileAsync(...args); },
  outputJson:        (...args) => { return fs.outputJsonAsync(...args); },
  outputJSON:        (...args) => { return fs.outputJSONAsync(...args); },
  read:              (...args) => { return fs.readAsync(...args); },
  readdir:           (...args) => { return fs.readdirAsync(...args); },
  readFile:          (...args) => { return fs.readFileAsync(...args); },
  readJson:          (...args) => { return fs.readJsonAsync(...args); },
  readJSON:          (...args) => { return fs.readJSONAsync(...args); },
  readJsonFile:      (...args) => { return fs.readJsonFileAsync(...args); },
  readJSONFile:      (...args) => { return fs.readJSONFileAsync(...args); },
  readlink:          (...args) => { return fs.readlinkAsync(...args); },
  realpath:          (...args) => { return fs.realpathAsync(...args); },
  remove:            (...args) => { return fs.removeAsync(...args); },
  rename:            (...args) => { return fs.renameAsync(...args); },
  rmdir:             (...args) => { return fs.rmdirAsync(...args); },
  stat:              (...args) => { return fs.statAsync(...args); },
  symlink:           (...args) => { return fs.symlinkAsync(...args); },
  touch:             (...args) => { return fs.touchAsync(...args); },
  truncate:          (...args) => { return fs.truncateAsync(...args); },
  unlink:            (...args) => { return fs.unlinkAsync(...args); },
  unwatchFile:       (...args) => { return fs.unwatchFileAsync(...args); },
  utimes:            (...args) => { return fs.utimesAsync(...args); },
  watch:             (...args) => { return fs.watchAsync(...args); },
  watchFile:         (...args) => { return fs.watchFileAsync(...args); },
  write:             (...args) => { return fs.writeAsync(...args); },
  writeFile:         (...args) => { return fs.writeFileAsync(...args); },
  writeJson:         (...args) => { return fs.writeJsonAsync(...args); },
  writeJSON:         (...args) => { return fs.writeJSONAsync(...args); },
  writeJsonFile:     (...args) => { return fs.writeJsonFileAsync(...args); },
  writeJSONFile:     (...args) => { return fs.writeJSONFileAsync(...args); },

};

module.exports = FileAsync;
