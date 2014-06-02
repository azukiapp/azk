import { async, _ } from 'azk';
import { Image as DImage, default as docker} from 'azk/docker';

var default_tag = "latest";

export class Image {
  constructor(image) {
    if (_.isString(image)) {
      this.name = image;
    } else {
      this.repository = image.repository;
      this.tag = image.tag || default_tag;
    }
  }

  check() {
    return docker.findImage(this.name);
  }

  pull(stdout) {
    var self = this;
    return async(function* () {
      var image = yield self.check();
      if (image == null) {
        yield docker.pull(self.repository, self.tag, _.isObject(stdout) ? stdout : null);
      }
      return image;
    });
  }

  set name(value) {
    var image = DImage.parseRepositoryTag(value);
    this.repository = image.repository;
    this.tag = image.tag || default_tag;
  }

  get name() {
    return `${this.repository}:${this.tag}`;
  }
}
