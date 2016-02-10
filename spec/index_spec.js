import h from 'spec/spec_helper';
import Azk from 'azk';

describe('azk main module', function() {

  it('should `version` get azk current version', function() {
    h.expect(Azk.version).to.match(/\d+\.\d+\.\d+/);
  });

  it('should commitId() get current commit id from ENV', function() {
    const last_commit_id = '123';
    return h.expect(Azk.commitId(last_commit_id))
      .to.eventually.to.equal(last_commit_id);
  });

  it('should commitId() get current commit id from dev project', function() {
    return h.expect(Azk.commitId()).to.eventually.not.be.undefined;
  });

  it('should commitDate get current commit date from dev project', function() {
    return h.expect(Azk.commitDate()).to.eventually.not.be.undefined;
  });

});
