import h from 'spec/spec_helper';
import Azk from 'azk';

describe('azk main module', function() {

  it('should `version` get azk current version', function() {
    h.expect(Azk.version).to.match(/\d+\.\d+\.\d+/);
  });

  it('should `gitCommitId` check if current azk is a dev version', function() {
    return h.expect(Azk.gitCommitId).to.eventually.not.be.undefined;
  });

});
