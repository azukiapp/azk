import h from 'spec/spec_helper';
import { _ } from 'azk';
import { SmartProgressBar } from 'azk/cli/smart_progress_bar';

describe('SmartProgressBar', function() {

  var smartProgressBar;

  beforeEach(function () {
    smartProgressBar = new SmartProgressBar();
  });

  it('should SmartProgressBar be instantiated', function() {
    h.expect(smartProgressBar).to.not.be.undefined;
  });

  it('should has parts', function() {
    h.expect(_.isArray(smartProgressBar._download_parts)).to.be.true;
  });

  it('should add and get a part', function() {
    var msg = {
      id            : 'abcd',
      progressDetail: {
        current: 200,
        total  : 2000
      }
    };

    smartProgressBar.addPart(msg);

    var part1 = smartProgressBar.getPartById('abcd');
    h.expect(part1.id).to.be.equal('abcd');
    h.expect(part1.current_downloaded_size).to.be.equal(200);
    h.expect(part1.total_downloaded_size).to.be.equal(2000);
  });

  it('should calculate percetage', function() {
    var msg = {
      id            : 'abcd',
      progressDetail: {
        current: 200,
        total  : 2000
      }
    };

    smartProgressBar.addPart(msg);

    var download_part1 = smartProgressBar.getPartById('abcd');
    h.expect(download_part1.getTotalPercentage()).to.be.equal(0.10);
  });

});
