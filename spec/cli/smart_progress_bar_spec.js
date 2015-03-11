import h from 'spec/spec_helper';
import { _ } from 'azk';
import { SmartProgressBar } from 'azk/cli/smart_progress_bar';

describe('SmartProgressBar progressbar', function() {

  var smartProgressBar, fake_progress_bar;

  beforeEach(function () {
    fake_progress_bar = { total_ticks: 0 };
    fake_progress_bar.tick = function(number) {
      this.total_ticks += number;
    };

    smartProgressBar = new SmartProgressBar(50, 10, fake_progress_bar);
  });

  it('should SmartProgressBar be instantiated', function() {
    h.expect(smartProgressBar).to.not.be.undefined;
  });

  it('should have parts', function() {
    h.expect(_.isArray(smartProgressBar._download_parts)).to.be.true;
  });

  it('should have bars count', function() {
    h.expect(_.isNumber(smartProgressBar._bar_count)).to.be.true;
  });

  it('should have layers count', function() {
    h.expect(_.isNumber(smartProgressBar._layers_count)).to.be.true;
  });

  it('should calculate bars per layers', function() {
    h.expect(smartProgressBar._bars_per_layers).to.be.equal(5);
  });

  it('should calculate percentage tick', function() {
    h.expect(smartProgressBar._percentage_tick).to.be.equal(0.2);
  });

  it('should add and get a part', function() {
    var msg = {
      id: 'abcd',
      progressDetail: {
        current: 200,
        total  : 2000
      }
    };

    smartProgressBar.receiveMessage(msg, 'download');

    var part1 = smartProgressBar.getPart(msg);
    h.expect(part1.id).to.be.equal('abcd');
    h.expect(part1.current_downloaded_size).to.be.equal(200);
    h.expect(part1.total_downloaded_size).to.be.equal(2000);
  });

  it('should calculate percetage', function() {
    var msg = {
      id: 'abcd',
      progressDetail: {
        current: 200,
        total  : 2000
      }
    };

    smartProgressBar.receiveMessage(msg, 'download');

    var download_part1 = smartProgressBar.getPart(msg);
    h.expect(download_part1.getTotalPercentage()).to.be.equal(0.10);
  });

  it('should calculate percetage', function() {
    var msg = {
      id            : 'abcd',
      progressDetail: {
        current: 200,
        total  : 2000
      }
    };

    smartProgressBar.receiveMessage(msg, 'download');

    var download_part1 = smartProgressBar.getPart(msg);
    h.expect(download_part1.getTotalPercentage()).to.be.equal(0.10);
  });

  it('should update downloaded_part when receives same message', function() {
    var msg = { id: 'abcd', progressDetail: { current: 200, total  : 2000 } };
    smartProgressBar.receiveMessage(msg, 'download');
    h.expect(smartProgressBar.getPart(msg).current_downloaded_size)
      .to.be.equal(200);

    msg = { id: 'abcd', progressDetail: { current: 300, total  : 2000 } };
    smartProgressBar.receiveMessage(msg, 'download');
    h.expect(smartProgressBar.getPart(msg).current_downloaded_size)
      .to.be.equal(300);
  });

});
