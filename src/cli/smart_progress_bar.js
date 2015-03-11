import { _ } from 'azk';

// var ProgressBar = require('progress');

class DownloadPart {
  constructor(id, current_downloaded_size, total_downloaded_size) {
    this.id = id;
    this.current_downloaded_size = current_downloaded_size;
    this.total_downloaded_size = total_downloaded_size;
  }

  getTotalPercentage() {
    return this.current_downloaded_size / this.total_downloaded_size;
  }
}

// TODO: Implement tests
export class SmartProgressBar {

  constructor() {
    this._download_parts = [];
  }

  addPart(msg) {
    var downloadPart = new DownloadPart(msg.id, msg.progressDetail.current, msg.progressDetail.total);

    this._download_parts.push(downloadPart);
  }

  getPartById(id) {
    return _.find(this._download_parts, function(part) {
      return part.id === id;
    });
  }

}
