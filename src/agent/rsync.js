import { defer } from 'azk';

var Worker = require('webworker-threads').Worker;

// Module
var Rsync = {
  sync_folders(host_folder, guest_folder) {
    return defer((resolve, reject) => {
      var worker = new Worker(function () {
        this.onmessage = function(event) {
          var self = this;
          console.log('event.data.host_folder', event.data.host_folder);
          console.log('Starting sync', event.data);
          var stop = new Date().getTime() + 8000;
          while (new Date().getTime() < stop) {
          }
          console.log('Sync done', event.data);
          self.postMessage('done');
          self.close();
        };
      });

      worker.onmessage = (event) => {
        console.log('worker response', event.data);
        (event.data === 'done') ? resolve() : reject('something went wrong.');
      };

      console.log('posting data:', {host_folder, guest_folder});
      worker.postMessage({host_folder, guest_folder});
    });
  },
};

export { Rsync };
