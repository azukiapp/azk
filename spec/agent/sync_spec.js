import h from 'spec/spec_helper';
import { async, config, path, _ } from 'azk';
import { Client } from 'azk/agent/client';
import { VM } from 'azk/agent/vm';

var qfs = require('q-io/fs');

describe.skip("Azk agent sync VM", function() {

  describe("with a running VM", function() {

    this.timeout(20000);
    var name = config("agent:vm:name");
    var data = "";

    var host_folder  = "/tmp/azk-test-host/";
    var guest_folder = "/tmp/azk-test-guest/";

    var dir = {'.': []};
    for (var i = 0; i < 3; i++) {
      dir['.'].push('f' + i);
    }
    dir['.'].push('f.css');
    dir['.'].push('f.js');

    for (i = 0; i < 3; i++) {
      var folder = 'd' + i;
      dir[folder] = [];
      for (var j = 0; j < 3; j++) {
        dir[folder].push('f' + j);
      }
      dir[folder].push('f.css');
      dir[folder].push('f.js');
    }

    var include = ['**/*.js' , 'd0/'];
    var except  = ['**/*.css', 'd1/'];

    var setup_host_folder = function() {
      _.each(dir, (files, folder) => {
        folder = path.join(host_folder, folder);
        qfs.makeDirectory(folder);
        _.each(files, (file) => {
          qfs.write(path.join(folder, file));
        });
      });
    };

    var clean_host_folder = function() {
      qfs.removeTree(host_folder);
    };

    beforeEach(() => {
      return async(this, function* () {
        data = "";
        yield setup_host_folder();
        yield VM.ssh(name, `rm -Rf ${guest_folder}`);
      });
    });

    afterEach(() => {
      return async(this, function* () {
        yield clean_host_folder();
      });
    });

    it("should get SSH opts", function() {
      var ssh_key  = `-i ${config('agent:vm:ssh_key')}`;
      var ssh_opts = ssh_key + " -o StrictHostKeyChecking=no -o LogLevel=quiet -o UserKnownHostsFile=/dev/null";
      var ssh_url  = `${config('agent:vm:user')}@${config('agent:vm:ip')}`;
      var ssh = Client.ssh_opts();

      h.expect(ssh.url).to.equal(ssh_url);
      h.expect(ssh.opts).to.equal(ssh_opts);
    });

    it("should not have guest folder", function() {
      return async(this, function* () {
        var result = yield VM.ssh(name, `ls -l ${guest_folder}`);
        h.expect(result).to.not.equal(0);
      });
    });

    it("should watch a folder", function() {
      var opts = { use_vm: true, ssh: Client.ssh_opts() };
      h.expect(Client.watch(host_folder, guest_folder, opts)).to.eventually.ok;
      h.expect(Client.unwatch(host_folder, guest_folder).then(() => Client.close_ws())).to.eventually.ok;
    });

    describe("with a watched folder", function() {

      before(function() {
        return async(this, function* () {
          var opts = { use_vm: true, ssh: Client.ssh_opts() };
          yield Client.watch(host_folder, guest_folder, opts);
        });
      });

      after(function() {
        return async(this, function* () {
          yield Client.unwatch(host_folder, guest_folder);
          Client.close_ws();
        });
      });

      it("should run the initial sync", function() {
        _.each(dir, (files, folder) => {
          h.expect(VM.ssh(name, `find ${path.join(guest_folder, folder)}`)).eventually.to.equal(0);
          _.each(files, (file) => {
            h.expect(VM.ssh(name, `find ${path.join(guest_folder, folder, file)}`)).eventually.to.equal(0);
          });
        });
      });

      describe("with file", function() {
        var existing_filepath = path.join(host_folder, 'f0');
        var new_filepath      = path.join(host_folder, 'new');

        it("should sync when added", function() {
          return async(this, function* () {
            yield qfs.write(new_filepath, 'content');
            h.expect(VM.ssh(name, `find ${new_filepath}`)).to.eventually.equal(0);
            h.expect(VM.ssh(name, `cat ${new_filepath}`)).to.eventually.contains('content');
          });
        });

        it("should sync when removed", function() {
          return async(this, function* () {
            yield qfs.remove(existing_filepath);
            h.expect(VM.ssh(name, `find ${existing_filepath}`)).to.eventually.not.equal(0);
          });
        });

        it("should sync when content changed", function() {
          return async(this, function* () {
            yield qfs.write(existing_filepath, 'content');
            h.expect(VM.ssh(name, `cat ${existing_filepath}`)).to.eventually.contains('content');
          });
        });

        it("should sync when renamed", function() {
          return async(this, function* () {
            yield qfs.move(existing_filepath, new_filepath);
            h.expect(VM.ssh(name, `find ${existing_filepath}`)).to.eventually.not.equal(0);
            h.expect(VM.ssh(name, `find ${new_filepath}`)).to.eventually.equal(0);
          });
        });
      });

      describe("with subfolder", function() {
        var existing_folder_path = path.join(host_folder, 'd1');
        var new_folder_path      = path.join(host_folder, 'newd');

        it("should sync when added", function() {
          return async(this, function* () {
            yield qfs.makeDirectory(new_folder_path);
            h.expect(VM.ssh(name, `find ${new_folder_path}`)).to.eventually.equal(0);
          });
        });

        it("should sync when removed", function() {
          return async(this, function* () {
            yield qfs.removeTree(existing_folder_path);
            h.expect(VM.ssh(name, `find ${existing_folder_path}`)).to.eventually.not.equal(0);
          });
        });

        it("should sync when renamed", function() {
          return async(this, function* () {
            yield qfs.move(existing_folder_path, new_folder_path);
            h.expect(VM.ssh(name, `find ${existing_folder_path}`)).to.eventually.not.equal(0);
            h.expect(VM.ssh(name, `find ${new_folder_path}`)).to.eventually.equal(0);
          });
        });
      });

      describe("in subfolder", function() {
        var existing_filepath = path.join(host_folder, 'd0', 'f0');
        var new_filepath      = path.join(host_folder, 'd0', 'new');

        it("should sync when file added", function() {
          return async(this, function* () {
            yield qfs.write(new_filepath, 'content');
            h.expect(VM.ssh(name, `find ${new_filepath}`)).to.eventually.equal(0);
            h.expect(VM.ssh(name, `cat ${new_filepath}`)).to.eventually.contains('content');
          });
        });

        it("should sync when file removed", function() {
          return async(this, function* () {
            yield qfs.remove(existing_filepath);
            h.expect(VM.ssh(name, `find ${existing_filepath}`)).to.eventually.not.equal(0);
          });
        });

        it("should sync when file's content changed", function() {
          return async(this, function* () {
            yield qfs.write(existing_filepath, 'content');
            h.expect(VM.ssh(name, `cat ${existing_filepath}`)).to.eventually.contains('content');
          });
        });

        it("should sync it when file renamed", function() {
          return async(this, function* () {
            yield qfs.move(existing_filepath, new_filepath);
            h.expect(VM.ssh(name, `find ${existing_filepath}`)).to.eventually.not.equal(0);
            h.expect(VM.ssh(name, `find ${new_filepath}`)).to.eventually.equal(0);
          });
        });
      });

    });

    describe("with a watched folder and files and subfolder in except", function() {

      var new_regular_file                       =  path.join(host_folder, 'new');
      var new_except_file                        =  path.join(host_folder, 'new.css');
      var existing_regular_file                  =  path.join(host_folder, 'f1');
      var existing_except_file                   =  path.join(host_folder, 'f.css');
      var existing_regular_folder                =  path.join(host_folder, 'd0');
      var existing_except_folder                 =  path.join(host_folder, 'd1');
      var existing_regular_file_in_except_folder =  path.join(host_folder, 'd1', 'f0');
      var new_regular_file_in_except_folder      =  path.join(host_folder, 'd1', 'new');
      var existing_except_file_in_regular_folder =  path.join(host_folder, 'd0', 'f.css');
      var new_except_file_in_regular_folder      =  path.join(host_folder, 'd0', 'new.css');

      before(function() {
        return async(this, function* () {
          var opts = { use_vm: true, ssh: Client.ssh_opts(), except };
          yield Client.watch(host_folder, guest_folder, opts);
        });
      });

      after(function() {
        return async(this, function* () {
          yield Client.unwatch(host_folder, guest_folder);
          Client.close_ws();
        });
      });

      it("should run the initial sync except files and folder", function() {
        h.expect(VM.ssh(name, `find ${existing_regular_file}`)).eventually.to.equal(0);
        h.expect(VM.ssh(name, `find ${existing_regular_folder}`)).eventually.to.equal(0);
        h.expect(VM.ssh(name, `find ${existing_except_file}`)).eventually.to.equal(1);
        h.expect(VM.ssh(name, `find ${existing_except_folder}`)).eventually.to.equal(1);
      });

      it("should sync when regular file added", function() {
        return async(this, function* () {
          yield qfs.write(new_regular_file, 'content');
          h.expect(VM.ssh(name, `find ${new_regular_file}`)).to.eventually.equal(0);
          h.expect(VM.ssh(name, `cat ${new_regular_file}`)).to.eventually.contains('content');
        });
      });

      it("should not sync when except file added", function() {
        return async(this, function* () {
          yield qfs.write(new_except_file, 'content');
          h.expect(VM.ssh(name, `find ${new_except_file}`)).to.eventually.equal(1);
        });
      });

      it("should not sync when except file removed", function() {
        return async(this, function* () {
          yield qfs.remove(existing_except_file);
          h.expect(VM.ssh(name, `find ${existing_except_file}`)).to.eventually.equal(1);
        });
      });

      it("should not sync when except file changed", function() {
        return async(this, function* () {
          yield qfs.write(existing_except_file, 'content');
          h.expect(VM.ssh(name, `find ${existing_except_file}`)).to.eventually.equal(1);
        });
      });

      describe("in regular folder", function() {
        it("should not sync when except file added", function() {
          return async(this, function* () {
            yield qfs.write(new_except_file_in_regular_folder, 'content');
            h.expect(VM.ssh(name, `find ${new_except_file_in_regular_folder}`)).to.eventually.equal(1);
          });
        });

        it("should not sync when except file removed", function() {
          return async(this, function* () {
            yield qfs.remove(existing_except_file_in_regular_folder);
            h.expect(VM.ssh(name, `find ${existing_except_file_in_regular_folder}`)).to.eventually.equal(1);
          });
        });

        it("should not sync when except file changed", function() {
          return async(this, function* () {
            yield qfs.write(existing_except_file_in_regular_folder, 'content');
            h.expect(VM.ssh(name, `find ${existing_except_file_in_regular_folder}`)).to.eventually.equal(1);
          });
        });
      });

      describe("in except folder", function() {
        it("should not sync when regular file added", function() {
          return async(this, function* () {
            yield qfs.write(new_regular_file_in_except_folder, 'content');
            h.expect(VM.ssh(name, `find ${new_regular_file_in_except_folder}`)).to.eventually.equal(1);
          });
        });

        it("should not sync when regular file removed", function() {
          return async(this, function* () {
            yield qfs.remove(existing_regular_file_in_except_folder);
            h.expect(VM.ssh(name, `find ${existing_regular_file_in_except_folder}`)).to.eventually.equal(1);
          });
        });

        it("should not sync when regular file changed", function() {
          return async(this, function* () {
            yield qfs.write(existing_regular_file_in_except_folder, 'content');
            h.expect(VM.ssh(name, `find ${existing_regular_file_in_except_folder}`)).to.eventually.equal(1);
          });
        });
      });

    });

    describe("with a watched folder and files and subfolder in include", function() {

      var new_regular_file                        =  path.join(host_folder, 'new');
      var new_include_file                        =  path.join(host_folder, 'new.js');
      var existing_regular_file                   =  path.join(host_folder, 'f1');
      var existing_include_file                   =  path.join(host_folder, 'f.js');
      var existing_regular_folder                 =  path.join(host_folder, 'd1');
      var existing_include_folder                 =  path.join(host_folder, 'd0');
      var existing_regular_file_in_include_folder =  path.join(host_folder, 'd0', 'f0');
      var new_regular_file_in_include_folder      =  path.join(host_folder, 'd0', 'new');
      var existing_include_file_in_regular_folder =  path.join(host_folder, 'd1', 'f.js');
      var new_include_file_in_regular_folder      =  path.join(host_folder, 'd1', 'new.js');

      before(function() {
        return async(this, function* () {
          var opts = { use_vm: true, ssh: Client.ssh_opts(), include };
          yield Client.watch(host_folder, guest_folder, opts);
        });
      });

      after(function() {
        return async(this, function* () {
          yield Client.unwatch(host_folder, guest_folder);
          Client.close_ws();
        });
      });

      it("should run the initial sync include files and folder", function() {
        h.expect(VM.ssh(name, `find ${existing_include_file}`)).eventually.to.equal(0);
        h.expect(VM.ssh(name, `find ${existing_include_folder}`)).eventually.to.equal(0);
        h.expect(VM.ssh(name, `find ${existing_regular_file}`)).eventually.to.equal(1);
        h.expect(VM.ssh(name, `find ${existing_regular_folder}`)).eventually.to.equal(1);
      });

      it("should not sync when regular file added", function() {
        return async(this, function* () {
          yield qfs.write(new_regular_file, 'content');
          h.expect(VM.ssh(name, `find ${new_regular_file}`)).to.eventually.equal(1);
        });
      });

      it("should sync when include file added", function() {
        return async(this, function* () {
          yield qfs.write(new_include_file, 'content');
          h.expect(VM.ssh(name, `find ${new_include_file}`)).to.eventually.equal(0);
          h.expect(VM.ssh(name, `cat ${new_include_file}`)).to.eventually.contains('content');
        });
      });

      it("should sync when include file removed", function() {
        return async(this, function* () {
          h.expect(VM.ssh(name, `find ${existing_include_file}`)).to.eventually.equal(0);
          yield qfs.remove(existing_include_file);
          h.expect(VM.ssh(name, `find ${existing_include_file}`)).to.eventually.equal(1);
        });
      });

      it("should sync when include file changed", function() {
        return async(this, function* () {
          yield qfs.write(existing_include_file, 'content');
          h.expect(VM.ssh(name, `find ${existing_include_file}`)).to.eventually.equal(0);
          h.expect(VM.ssh(name, `cat ${existing_include_file}`)).to.eventually.contains('content');
        });
      });

      describe("in regular folder", function() {
        it("should not sync when include file added", function() {
          return async(this, function* () {
            yield qfs.write(new_include_file_in_regular_folder, 'content');
            h.expect(VM.ssh(name, `find ${new_include_file_in_regular_folder}`)).to.eventually.equal(1);
          });
        });

        it("should not sync when include file removed", function() {
          return async(this, function* () {
            yield qfs.remove(existing_include_file_in_regular_folder);
            h.expect(VM.ssh(name, `find ${existing_include_file_in_regular_folder}`)).to.eventually.equal(1);
          });
        });

        it("should not sync when include file changed", function() {
          return async(this, function* () {
            yield qfs.write(existing_include_file_in_regular_folder, 'content');
            h.expect(VM.ssh(name, `find ${existing_include_file_in_regular_folder}`)).to.eventually.equal(1);
          });
        });
      });

      describe("in include folder", function() {
        it("should sync when regular file added", function() {
          return async(this, function* () {
            yield qfs.write(new_regular_file_in_include_folder, 'content');
            h.expect(VM.ssh(name, `find ${new_regular_file_in_include_folder}`)).to.eventually.equal(0);
          });
        });

        it("should sync when regular file removed", function() {
          return async(this, function* () {
            h.expect(VM.ssh(name, `find ${existing_regular_file_in_include_folder}`)).to.eventually.equal(0);
            yield qfs.remove(existing_regular_file_in_include_folder);
            h.expect(VM.ssh(name, `find ${existing_regular_file_in_include_folder}`)).to.eventually.equal(1);
          });
        });

        it("should sync when regular file changed", function() {
          return async(this, function* () {
            yield qfs.write(existing_regular_file_in_include_folder, 'content');
            h.expect(VM.ssh(name, `find ${existing_regular_file_in_include_folder}`)).to.eventually.equal(0);
            h.expect(VM.ssh(name, `cat ${existing_regular_file_in_include_folder}`)).to.eventually.contains('content');
          });
        });
      });

    });

  });

});
