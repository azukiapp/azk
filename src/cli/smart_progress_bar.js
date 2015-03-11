import { _ } from 'azk';
// var ProgressBar = require('progress');

class DownloadPart {
  constructor(msg) {
    this.id = msg.id;
    this.current_downloaded_size = msg.progressDetail.current;
    this.total_downloaded_size = msg.progressDetail.total;
  }

  getTotalPercentage() {
    return this.current_downloaded_size / this.total_downloaded_size;
  }

  update(msg) {
    this.current_downloaded_size = msg.progressDetail.current;
  }
}

export class SmartProgressBar {

  constructor(bar_count, layers_count) {
    this._download_parts = [];
    this._bar_count = bar_count;
    this._layers_count = layers_count;
    this._bars_per_layers = this._calculate_bars_per_layers();
    this._percentage_tick = this._calculate_percentage_tick();
  }

  _calculate_bars_per_layers() {
    return this._bar_count / this._layers_count;
  }

  _calculate_percentage_tick() {
    return 1.0 / this._bars_per_layers;
  }

  receiveMessage(msg) {
    var current_download_part = this.getPart(msg);
    if (!current_download_part) {
      var downloadPart = new DownloadPart(msg);
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
