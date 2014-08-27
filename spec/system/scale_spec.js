import h from 'spec/spec_helper';
import { config, async, Q } from 'azk';
import { System } from 'azk/system';
import { Scale } from 'azk/system/scale';
import { SystemDependError, SystemNotScalable } from 'azk/utils/errors';
import docker from 'azk/docker';

describe("Azk system class, scale set", function() {
  var manifest, system, system_db;

  before(function() {
    return h.mockManifest({}).then((mf) => {
      manifest  = mf;
      system    = manifest.system("example");
      system_db = manifest.system("db");
    });
  });

  describe("scale one system", function() {
    afterEach(function() {
      return system.killAll().fail(() => {});
    });

    it("should not run system if its dependencies are not met", function() {
      var result = system.scale(1, { dependencies: false });
      return h.expect(result).to.eventually.rejectedWith(SystemDependError);
    });

    it("should raise erro if scale system above the limit of instances", function() {
      var result = system_db.scale(2);
      return h.expect(result).to.eventually.rejectedWith(SystemNotScalable);
    });

    it("should scale one instances", function() {
      var db = manifest.system('db');
      return async(this, function* () {
        var result = yield db.scale(1);
        var instances = yield db.instances();

        h.expect(result).to.eql(1);
        h.expect(instances).to.length(1);

        var container   = yield docker.getContainer(instances[0].Id).inspect();
        var annotations = container.Annotations.azk;
        h.expect(annotations).to.have.deep.property("type", 'daemon');
        h.expect(annotations).to.have.deep.property("sys", db.name);
        h.expect(annotations).to.have.deep.property("seq", '1');
      });
    });

    it("should by default remove the instance after stopping the same", function() {
      var db = manifest.system('db');
      return async(this, function* () {
        var result    = yield db.scale(1);
        var instances = yield db.instances();

        h.expect(instances).to.length(1);
        var id = instances[0].Id;

        yield db.scale(0);
        result = yield docker.findContainer(id);
        h.expect(result).to.null;
      });
    });

    it("should skip remove the instance", function() {
      var db = manifest.system('db');
      return async(this, function* () {
        var result    = yield db.scale(1);
        var instances = yield db.instances();

        h.expect(instances).to.length(1);
        var id = instances[0].Id;

        yield db.scale(0, { remove: false });
        result = yield docker.findContainer(id);
        h.expect(result).to.not.null;
      });
    });

    describe("with dependencies is run", function() {
      it("should scale a system with dependencies", function() {
        return async(this, function* () {
          var result = yield system.scale(3);
          var instances = yield system.instances();

          h.expect(result).to.eql(3);
          h.expect(instances).to.length(3);

          var container   = yield docker.getContainer(instances[0].Id).inspect();
          var annotations = container.Annotations.azk;
          h.expect(annotations).to.have.deep.property("type", 'daemon');
          h.expect(annotations).to.have.deep.property("sys", system.name);
          h.expect(annotations).to.have.deep.property("seq", '1');
        });
      });

      it("should return inc of the instances", function() {
        return async(this, function* () {
          var icc = 0;

          icc = yield system.scale(3);
          h.expect(icc).to.equal(3);

          icc = yield system.scale(1);
          h.expect(icc).to.equal(-2);
        });
      });

      it("should run default instances", function() {
        return async(this, function* () {
          var icc, api = manifest.system("api");
          yield api.stop();

          icc = yield api.start();
          h.expect(icc).to.equal(1);

          icc = yield system.start();
          h.expect(icc).to.equal(3);
        });
      });

      it("should not do anything to scale from 0 to 0", function() {
        return async(this, function* () {
          var icc, instances, api = manifest.system("api");
          yield api.stop();

          instances = (yield system.instances())
          h.expect(instances).to.length(0);

          icc = yield api.scale(0);
          h.expect(icc).to.equal(0);

          instances = (yield system.instances())
          h.expect(instances).to.length(0);
        });
      });

      it("should scale a system and map dependencies envs", function() {
        return async(this, function* () {
          yield manifest.system('example').scale(1);

          var instances = yield system.instances();
          var container = yield docker.getContainer(instances[0].Id).inspect();
          var envs = container.Config.Env;

          h.expect(envs).to.include.something.match(/PATH=/);
          h.expect(envs).to.include.something.match(/DB_HTTP_PORT=/);
          h.expect(envs).to.include.something.match(/DB_5000_HOST=/);
          h.expect(envs).to.include.something.match(/DB_URL=username:password@.*:\d*/);
          h.expect(envs).to.include.something.match(/API_URL=http:\/\/api.*/);
        });
      });
    });
  });
});

