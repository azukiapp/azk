import { _, async } from 'azk';
import docker from 'azk/docker';
import { ImageNotAvailable } from 'azk/utils/errors';

var Run = {
  runShell(system, command, options = {}) {
    return this.checkImage(system, options).then((image) => {
      options = system.shellOptions(options);
      return docker.run(system.image.name, command, options);
    });
  },

  runDaemon(system, options = {}) {
    return this.checkImage(system, options).then((image) => {
      options.image_data = image;
      options = system.daemonOptions(options);
      var command = options.command;
      return docker.run(system.image.name, command, options);
    });
  },

  // Check and pull image
  checkImage(system, options) {
    options = _.defaults(options, {
      image_pull: true,
    });

    return async(function* () {
      if (options.image_pull) {
        var promise = system.image.pull();
      } else {
        var promise = system.image.check().then((image) => {
          if (image == null) {
            throw new ImageNotAvailable(system.name, system.image.name);
          }
          return image;
        });
      }

      var image = yield promise.progress((event) => {
        event.system = system;
        return event;
      });

      return image.inspect();
    });
  },
}

export { Run }
