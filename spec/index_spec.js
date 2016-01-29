import h from 'spec/spec_helper';
import Azk from 'azk';

describe('azk main module', function() {

  it('should `version` get azk current version', function() {
    h.expect(Azk.version).to.match(/\d+\.\d+\.\d+/);
  });

  it('should `gitCommitIdAsync` get current commit id from ENV', function() {
    const last_commit_id = '123';
    return h.expect(Azk.gitCommitIdAsync(last_commit_id))
      .to.eventually.to.equal(last_commit_id);
  });

  it('should `gitCommitIdAsync` get current commit id from dev project', function() {
    return h.expect(Azk.gitCommitIdAsync()).to.eventually.not.be.undefined;
  });

});
