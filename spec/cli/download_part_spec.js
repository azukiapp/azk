import h from 'spec/spec_helper';
import { DownloadPart } from 'azk/cli/download_part';

describe('DownloadPart progressbar', function() {

  var download_part, fake_progress_bar;

  fake_progress_bar = { total_ticks: 0 };
  fake_progress_bar.tick = function(number) {
    this.total_ticks += number;
  };

  beforeEach(function () {
    var msg = {
      id: 'abcd',
      progressDetail: {
        current: 10,
        total  : 100
      }
    };
    fake_progress_bar.total_ticks = 0;
    download_part = new DownloadPart(msg, 5, fake_progress_bar);
  });

  it('should DownloadPart be instantiated', function() {
    h.expect(download_part).to.not.be.undefined;
  });

  it('should have bars to spend', function() {
    h.expect(download_part._representing_bars).to.be.equal(5);
  });

  it('should split total in equal parts', function() {
    h.expect(download_part._part_size).to.be.equal(20);
  });

  it('should call _progress_bar tick()', function() {
    download_part.update({ id: 'abcd', progressDetail: { current: 0, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(0);

    download_part.update({ id: 'abcd', progressDetail: { current: 10, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(0.5);

    download_part.update({ id: 'abcd', progressDetail: { current: 20, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(1);

    download_part.update({ id: 'abcd', progressDetail: { current: 30, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(1.5);

    download_part.update({ id: 'abcd', progressDetail: { current: 40, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(2);

    download_part.update({ id: 'abcd', progressDetail: { current: 50, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(2.5);

    download_part.update({ id: 'abcd', progressDetail: { current: 60, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(3);

    download_part.update({ id: 'abcd', progressDetail: { current: 100, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(5);
  });

  it('should call all ticks when download finished', function() {
    download_part.update({ id: 'abcd', progressDetail: { current: 0, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(0);

    download_part.update({ id: 'abcd', progressDetail: { current: 40, total  : 100 } });
    h.expect(fake_progress_bar.total_ticks).to.be.equal(2);

    download_part.setComplete();
    h.expect(fake_progress_bar.total_ticks).to.be.equal(5);
  });

});
