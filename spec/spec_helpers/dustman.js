import docker from 'azk/docker';
import { Q, Azk, pp, _, config, t } from 'azk';

export function extend(Helpers) {
  // Filters
  var c_regex = RegExp(`\/${Helpers.escapeRegExp(config('docker:namespace'))}`);
  var filter_containers = (container) => {
    return container.Names[0].match(c_regex);
  }

  var t_regexs = [
    RegExp(`${Helpers.escapeRegExp(config('docker:image_empty'))}`),
    RegExp(`${Helpers.escapeRegExp(config('docker:repository'))}`),
  ]
  var filter_tags = (tag) => {
    return _.some(t_regexs, (regex) => { return tag.match(regex) });
  }

  // Remove all containers before run
  before(function() {
    this.timeout(0);
    console.log(t('test.before'));

    var results = Q.async(function* () {
      // Remove containers
      var containers = yield docker.listContainers({ all: true });
      containers = _.filter(containers, filter_containers);
      console.log(t('test.remove_containers', containers.length));
      yield Q.all(_.map(containers, (container) => {
        return docker.getContainer(container.Id).remove({ force: true });
      }));

      // Remove images
      var tags   = _.flatten(_.map(
        yield docker.listImages(),
        (image) => { return image.RepoTags }
      ));

      tags = _.filter(tags, filter_tags);
      console.log(t('test.remove_images', tags.length));
      yield Q.all(_.map(tags, (tag) => {
        return docker.getImage(tag).remove();
      }));
    })();

    return results.then(() => console.log("\n"));
  });
}
