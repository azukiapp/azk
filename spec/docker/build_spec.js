import { _, config, path, lazy_require } from 'azk';
import h from 'spec/spec_helper';
import { DockerBuildError } from 'azk/utils/errors';

var l = lazy_require({
  semver: 'semver',
});

describe("Azk docker module, image build @slow", function() {
  this.timeout(20000);
  var repository = config('docker:build_name') + '/buildtest';

  var build = (file_path, tag) => {
    tag = tag || null;
    var build_options = {
      dockerfile: path.join(h.fixture_path('build'), file_path),
      tag: `${repository}:${tag || file_path}`,
    };
    return h.docker.build(build_options);
  };

  describe('with a valid Dockerfile', function () {
    // Used to test the performance of a container
    var outputs = { };
    var mocks = h.mockOutputs(beforeEach, outputs);

    it("should generate a valid image", function() {
      return build('Dockerfile', 'sucess')
        .then((image) => {
          var result = h.docker.run(
            image.name,
            ["/bin/bash", "-c", "/run.sh" ],
            { stdout: mocks.stdout, stderr: mocks.stderr, rm: true }
          );

          return result.then((container) => {
            h.expect(outputs.stdout).to.match(/^'Sucess!!'$/m);
            h.expect(outputs.stdout).to.match(/^Run \/entrypoint.sh$/m);
            return container.remove();
          });
        });
    });

    it("should generate a valid image with add files", function() {
      return build('Dockerfile', 'sucess')
        .then((image) => {
          var result = h.docker.run(
            image.name,
            ["/bin/bash", "-c", "ls -la /all" ],
            { stdout: mocks.stdout, stderr: mocks.stderr, rm: true }
          );

          return result
            .then((container) => {
              return container.remove();
            })
            .then(() => {
              h.expect(outputs.stdout).to.match(/^d.*dir_to_add$/m);
              h.expect(outputs.stdout).to.match(/^-.*file_to_add$/m);
              h.expect(outputs.stdout).to.not.match(/^-.*Dockerfile$/m);
              h.expect(outputs.stdout).to.not.match(/^-.*DockerfileFrom404$/m);
              h.expect(outputs.stdout).to.not.match(/^-.*.dockerignore$/m);
              h.expect(outputs.stdout).to.not.match(/^d.*build$/m);
            });
        });
    });

    it("should parse progress messages", function() {
      var events = [];
      return build('Dockerfile')
        .progress((event) => events.push(event))
        .then(() => {

          var status = [
            'building_from',
            'building_maintainer',
            'building_complete',
          ];
          _.each(status, (status) => {
            h.expect(events)
              .to.contain.an.item.with.deep.property('statusParsed.type', status);
          });
        });
    });
  });

  describe("with a invalids Dockerfile's", function () {
    var docker_version = null;

    before(() => {
      return h.docker.version().then((versions) => {
        docker_version = versions.Version;
      });
    });

    it("should raise error for a invalid image", function() {
      var events = [];
      return build('DockerfileInvalid')
        .progress((event) => {
          events.push(event);
        })
        .then(() => {
          // test for Docker 1.2
          h.expect(events).to.be.length(1);
          h.expect(events[0].statusParsed).to.be.deep.equal({});
        })
        .catch((rejection) => {
          if (l.semver.cmp(docker_version, '>=', '1.6.0')) {
            h.expect(rejection.translation_key).to.equal('docker_build_error.unknow_instrction_error');
          } else {
            h.expect(rejection.translation_key).to.equal('docker_build_error.server_error');
          }
        });
    });

    it("should raise error for a invalid step", function() {
      var events = [];
      return build('DockerfileBuildError')
        .progress((event) => {
          events.push(event);
        })
        .then(() => {
          // test for Docker 1.2
          h.expect(events).to.be.length(1);
          h.expect(events[0].statusParsed).to.be.deep.equal({});
        })
        .catch((rejection) => {
          // test for Docker 1.4
          h.expect(rejection.translation_key).to.equal('docker_build_error.command_error');
        });
    });

    it("should raise error for not found from", function() {
      this.timeout(50000);
      return h.expect(build('DockerfileFrom404')).to.be.rejectedWith(DockerBuildError, /not_found/);
    });
  });
});
