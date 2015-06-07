import { Q, _, config, t, defer, publish, subscribe } from 'azk';

export function extend(Helpers) {
  var h = Helpers;

  var t_regexs = [
    RegExp(`${Helpers.escapeRegExp(config('docker:image_empty'))}`),
    RegExp(`${Helpers.escapeRegExp(config('docker:repository'))}`),
    RegExp(`${Helpers.escapeRegExp(config('docker:build_name'))}`),
  ];
  var filter_tags = (tag) => {
    return _.some(t_regexs, (regex) => { return tag.match(regex); });
  };

  Helpers.remove_containers = function() {
    return defer(() => {
      return h.docker.azkListContainers({ all: true }).then((containers) => {
        publish("spec.dustman.remove_containers.message", t('test.remove_containers', containers.length));
        return Q.all(_.map(containers, (container) => {
          var c = h.docker.getContainer(container.Id);
          return c.kill().then(() => {
            return c.remove({ force: true });
          });
        }));
      });
    });
  };

  Helpers.remove_images = function() {
    return defer(() => {
      return h.docker.listImages().then((images) => {
        var tags = _.flatten(_.map(
          images, (image) => { return image.RepoTags; }
        ));
        tags = _.filter(tags, filter_tags);
        publish("spec.dustman.remove_images.message", t('test.remove_images', tags.length));
        return Q.all(_.map(tags, (tag) => {
          return h.docker.getImage(tag).remove();
        }));
      });
    });
  };

  // Remove all containers before run
  // if no_required_agent is disabled
  if (!Helpers.no_required_agent) {
    var _subscription;
    before(function() {
      this.timeout(0);
      _subscription = subscribe('spec.dustman.#', (event) => console.log(`  ${event}`) );
      var funcs = [
        Helpers.remove_containers,
        Helpers.remove_images,
        () => console.log("\n")
      ];
      return funcs.reduce(Q.when, Q());
    });
  }

  after(() => {
    if (_subscription) {
      _subscription.unsubscribe();
    }
  });
}
