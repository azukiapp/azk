import { async, defer, _, lazy_require } from 'azk';

var default_tag = "latest";

lazy_require(this, {
  DImage() {
    return require('azk/docker').Image;
  },

  docker() {
    return require('azk/docker').default;
  }
});

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
    return defer((_resolve, _reject, notify) => {
      notify({ type: "action", context: "image", action: "check_image" });
      return docker.findImage(this.name);
    });
  }

  pull(stdout) {
    return async(this, function* (notify) {
      var image = yield this.check();
      if (image == null) {
        notify({ type: "action", context: "image", action: "pull_image", data: this });
        image = yield docker.pull(this.repository, this.tag, _.isObject(stdout) ? stdout : null);
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
