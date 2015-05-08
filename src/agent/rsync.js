import { defer } from 'azk';

// var Worker = require('webworker-threads').Worker;
var RsyncR = require('rsync');

// Module
var Rsync = {
  sync_folders(host_folder, guest_folder) {
    return defer((resolve, reject) => {
      // return defer((resolve) => {
      console.log('inside rsync');
      // var self = this;
      var r = new RsyncR()
        .shell('sh')
        .flags('az')
        .source(host_folder)
        .destination(guest_folder);

      console.log('-----------------------------');
      console.log(r);

      r.execute(function(error, code, cmd) {
        console.log('running');
        console.log(cmd);
        if (!error) {
          resolve();
        }
        reject();
      });

      //   var worker = new Worker(function () {
      //     this.onmessage = function(event) {
      //       console.log('Starting sync', event.data);
      //       // self._do_sync(event.data.host_folder, event.data.guest_folder);

      //       // var stop = new Date().getTime() + 4000;
      //       // while (new Date().getTime() < stop) {
      //       // }
      //       // console.log('Sync done', event.data);
      //       self.postMessage('done');
      //       self.close();
      //     };
      //   });

      //   worker.onmessage = (event) => {
      //     console.log('worker response', event.data);
      //     (event.data === 'done') ? resolve() : reject('something went wrong.');
      //   };

      //   console.log('posting data:', {host_folder, guest_folder});
      //   worker.postMessage({host_folder, guest_folder});
    });
  },

  // _do_sync(host_folder, guest_folder, callback = null) {
  //   console.log('Sync', host_folder, guest_folder);
  //   var rsync = new Rsync()
  //     .shell('sh')
  //     .flags('avz')
  //     .source(host_folder)
  //     .destination(guest_folder);

  //   rsync.execute(callback);
  // }
};

export { Rsync };
