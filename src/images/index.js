import { async, defer, _, lazy_require } from 'azk';

var default_tag      = "latest";
var default_provider = "docker";

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

    // 1. only a string, will be deprecated. i.e.: 'azukiapp/azktcl:0.0.2'
    if (_.isString(image)) {
      this.provider = 'docker';
      this.isDeprecated = true;
      this.name = image;
      return null;
    }

    // 2. provider object. i.e.: { docker: 'azukiapp/azktcl:0.0.2' }
    var keys = _.keys(image);
    if (keys.length === 1 && (keys[0] === 'docker' ||
                              keys[0] === 'dockerfile') ) {
      this.provider = keys[0];
      this.name = image[keys[0]];
      return null;
    }

    // 3. specific properties
    this.repository = image.repository;
    this.tag        = image.tag      || default_tag;
    this.provider   = image.provider || default_provider;
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
    var imageParsed = DImage.parseRepositoryTag(value);
    this.repository = imageParsed.repository;
    this.tag        = imageParsed.tag      || default_tag;
    this.provider   = imageParsed.provider || default_provider;
  }

  get name() {
    return `${this.repository}:${this.tag}`;
  }

  get full_name() {
    return `{ ${this.provider}: "${this.repository}:${this.tag}" }`;
  }
}
