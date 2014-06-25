import h from 'spec/spec_helper';
import { config, path, t } from 'azk';
import { init } from 'azk/cmds/up';
import { Manifest } from 'azk/manifest';
import { Scale } from 'azk/system/scale';

describe("Azk command up", function() {
  var outputs  = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var cmd = init(UI);
  var project, manifest;

  before(function() {
    return h.mockManifest({}).then((dir) => {
      project  = dir;
      manifest = new Manifest(dir);
    });
  });

  after(function() {
    return Scale.stop(manifest);
  })

  //describe("run in a project already has a manifest", function() {
    //var project;

    //before(() => {
      //return h.tmp_dir().then((dir) => {
        //project = dir;
        //cmd.cwd = project;
        //h.touchSync(path.join(project, manifest));
      //});
    //});

    //it("should fail", function() {
      //var message = t("commands.init.already", manifest);
      //return cmd.run([]).then((code) => {
        //h.expect(code).to.equal(1);
        //h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp(message)));
      //});
    //});

    //it("should sucess if --force is passed", function() {
      //var message = t("commands.init.already", manifest);
      //return cmd.run(["--force"]).then((code) => {
        //h.expect(code).to.equal(0);
        //h.expect(outputs[0]).to.not.match(RegExp(h.escapeRegExp(message)));
      //});
    //});
  //});
});

