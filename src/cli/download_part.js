import { log } from 'azk';

export class DownloadPart {
  constructor(msg, representing_bars, progress_bar) {
    // set progress bar link
    this._progress_bar         = progress_bar;

    // get info from docker remote message
    this.id                    = msg.id;
    this.total_downloaded_size = msg.progressDetail.total;

    // associate with progress bar
    this._representing_bars    = representing_bars;
    this._part_size            = this._calculate_part_size();
    this._last_tick_current    = 0;

    // get current size from message
    this.update(msg);

    log.debug('\n>>---------\n DownloadPart:', this, '\n>>---------\n');
  }

  getTotalPercentage() {
    return this.current_downloaded_size / this.total_downloaded_size;
  }

  update(msg) {
    var current_after_last_tick, ticks_to_be_called;

    // get current size from progressDetail docker remote message
    this.current_downloaded_size = msg.progressDetail.current;

    // current chunk
    current_after_last_tick = this.current_downloaded_size - this._last_tick_current;

    // calculate percentual bar tick
    ticks_to_be_called = current_after_last_tick / this._part_size;
    this._progress_bar.tick(ticks_to_be_called);

    // save _last_tick_current to get chunk on next round
    this._last_tick_current = this.current_downloaded_size;
  }

  setComplete() {
    this.update({
      progressDetail: {
        current: this.total_downloaded_size
      }
    });
  }

  _calculate_part_size() {
    return this.total_downloaded_size / this._representing_bars;
  }
}
