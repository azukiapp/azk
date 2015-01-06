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

    // only a string, will be deprecated
    if (_.isString(image)) {
      this.provider = 'docker';
      this.isDeprecated = true;
      this.name = image;
      return null;
    }

    var keys = _.keys(image);
    if (keys.length === 1) {
      this.provider = keys[0];

      if (this.provider === 'docker') {
        this.name = image[keys[0]];
        return null;
      } else{
        this.repository = image.repository;
        this.tag        = image.tag      || default_tag;
        this.provider   = image.provider || default_provider;
      }
    }
    else {
      this.repository = image.repository;
      this.tag        = image.tag      || default_tag;
      this.provider   = image.provider || default_provider;
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
