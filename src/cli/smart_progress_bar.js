import { _, log } from 'azk';
import { DownloadPart } from 'azk/cli/download_part';
// var ProgressBar = require('progress');

export class SmartProgressBar {

  /**
   * manages a progress bar without knowing total size previously
   * @param  {number} bar_count    total bars in progress bar
   * @param  {number} layers_count total layers left do download
   * @param  {object} progress_bar the progress bar
   */
  constructor(bar_count, layers_count, progress_bar) {
    this._progress_bar = progress_bar;

    this._download_parts = [];
    this._bar_count = bar_count;
    this._layers_count = layers_count;
    this._bars_per_layers = this._calculate_bars_per_layers();
    this._percentage_tick = this._calculate_percentage_tick();
    this._download_finished_count = 0;

    log.debug('\n>>---------\n SmartProgressBar:', this, '\n>>---------\n');
  }

  _calculate_bars_per_layers() {
    return this._bar_count / this._layers_count;
  }

  _calculate_percentage_tick() {
    return 1.0 / this._bars_per_layers;
  }

  receiveMessage(msg, msg_type) {
    var current_download_part = this.getPart(msg);

    if (_.isUndefined(current_download_part)) {
      current_download_part = new DownloadPart(msg,
        this._bars_per_layers,
        this._internal_tick.bind(this));

      this._download_parts.push(current_download_part);
    }

    if (msg_type === 'download_complete') {
      // prevent maximum layers downloaded overflow
      if (this._download_finished_count < this._layers_count) {
        this._download_finished_count++;
      }
      // set layer to 100% and tick
      current_download_part.setComplete();
    } else if (msg_type === 'download') {
      // update and tick
      current_download_part.update(msg);
    }

  }

  _internal_tick(tick_value) {

    // prevent progress-bar overflow
    if (this._progress_bar.curr + tick_value > this._bar_count) {
      return;
    }

    this._progress_bar.tick(tick_value, {
      layers_left : this._download_finished_count,
      layers_total: this._layers_count,
    });
  }

  getPart(msg) {
    return _.find(this._download_parts, function(part) {
      return part.id === msg.id;
    });
  }

}
