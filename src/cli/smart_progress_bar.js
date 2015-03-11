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

    if (msg_type === 'download_complete') {
      return current_download_part.setComplete();
    }

    if (!current_download_part) {
      var downloadPart = new DownloadPart(msg, this._bars_per_layers, this._progress_bar);
      this._download_parts.push(downloadPart);
    } else {
      current_download_part.update(msg);
    }

  }

  getPart(msg) {
    return _.find(this._download_parts, function(part) {
      return part.id === msg.id;
    });
  }

}
