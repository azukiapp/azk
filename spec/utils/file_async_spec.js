import h from 'spec/spec_helper';
import { async } from 'azk/utils/promises';
import { fsAsync } from 'azk';

describe('FileAsync - fsAsync:', function() {

  it('should read a file', function () {
    return async(function* () {
      var file_content = yield fsAsync.readFile(__filename);
      h.expect(file_content.toString()).not.been.undefined;
    });
  });

  it('should get fsStat from file', function () {
    return async(function* () {
      var fsStat = yield fsAsync.stat(__filename);
      h.expect(fsStat.isFile()).to.eql(true);
    });
  });

  it('should write a file', function () {
    return async(function* () {
      var TMP_FILE_PATH = '/tmp/file_content.js';

      // get this content
      var file_content = yield fsAsync.readFile(__filename);

      // write file
      yield fsAsync.writeFile(TMP_FILE_PATH, file_content.toString());

      // check file stat
      var stat = yield fsAsync.stat(TMP_FILE_PATH);
      h.expect(stat.isFile()).to.be.equal(true);
    });
  });

  it('should copy a folder to another', function () {
    return async(function* () {
      // read: get this content
      var file_content = yield fsAsync.readFile(__filename);
      file_content = file_content.toString();

      // mkdirs: create folders
      yield fsAsync.mkdirs('/tmp/folder1/folder2/');

      // stat: check if folder were created
      h.expect(( yield fsAsync.stat('/tmp/folder1') ).isDirectory()).to.be.equal(true);
      h.expect(( yield fsAsync.stat('/tmp/folder1/folder2') ).isDirectory()).to.be.equal(true);

      // write: write files
      yield fsAsync.writeFile('/tmp/folder1/some-file-1.js', file_content);
      yield fsAsync.writeFile('/tmp/folder1/folder2/some-file-2.js', file_content);

      // copy: copy file tree
      yield fsAsync.copy('/tmp/folder1/', '/tmp/folder1-copy/');

      // stat: check file stat
      h.expect(( yield fsAsync.stat('/tmp/folder1-copy/some-file-1.js') ).isFile()).to.be.equal(true);
      h.expect(( yield fsAsync.stat('/tmp/folder1-copy/folder2/some-file-2.js') ).isFile()).to.be.equal(true);

      // remove: clean-up
      yield fsAsync.remove('/tmp/folder1');
      yield fsAsync.remove('/tmp/folder1-copy');

      // exists: check if folders do not exists anymore
      h.expect(( yield fsAsync.exists('/tmp/folder1') )).to.be.equal(false);
      h.expect(( yield fsAsync.exists('/tmp/folder1-copy') )).to.be.equal(false);
    });
  });

  it('should create and check a symbolic link', function () {
    return async(function* () {
      // read: get this content
      var file_content = yield fsAsync.readFile(__filename);

      // mkdirs: create folders
      yield fsAsync.mkdirs('/tmp/folder1/folder2/');

      // write: write files
      yield fsAsync.writeFile('/tmp/folder1/some-file-1.js', file_content.toString());
      yield fsAsync.symlink('/tmp/folder1/some-file-1.js', '/tmp/folder1/folder2/some-file-symlink-1.js', 'file');

      // stat: check file stat
      h.expect(( yield fsAsync.stat('/tmp/folder1/some-file-1.js') ).isFile()).to.be.equal(true);

      h.expect(( yield fsAsync.lstat('/tmp/folder1/folder2/some-file-symlink-1.js') )
        .isSymbolicLink()).to.be.equal(true);

      // remove: clean-up
      yield fsAsync.remove('/tmp/folder1');

      // exists: check if folders do not exists anymore
      h.expect(( yield fsAsync.exists('/tmp/folder1') )).to.be.equal(false);
    });
  });

});
