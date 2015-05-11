import { defer } from 'azk';

// var Worker = require('webworker-threads').Worker;
var RsyncR = require('rsync');

// Module
var Rsync = {
  sync(host_folder, guest_folder) {
    return defer((resolve, reject) => {
      // TODO: Add progress to log single file sync
      var r = new RsyncR()
        .shell('sh')
        .flags('az')
        .set('rsync-path', `mkdir -p ${guest_folder} && rsync`)
        .source(host_folder)
        .destination(guest_folder);

      r.execute(function(error) {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  },

};

export { Rsync };
