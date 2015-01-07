import { async, defer, _, lazy_require } from 'azk';

var AVAILABLE_PROVIDERS = ["docker", "dockerfile", "rocket"];
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
      this.isDeprecated = true;
      this.name = image;
      return null;
    }

    this.provider = image;

    if (!image.repository && this.provider) {
      // 2. i.e.: { dockerfile: 'azukiapp/azktcl' }
      this.name = image[this.provider];
    } else {
      // 3. i.e.: { provider: 'dockerfile', repository: 'azukiapp/azktcl' }
      this.repository = image.repository;
      this.tag        = image.tag || default_tag;
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

  set provider(image) {
    if (image.provider && _.contains(AVAILABLE_PROVIDERS, image.provider)) {
      this._provider = image.provider;
    } else {
      var provider = _.find(_.keys(image), function(key) {
        if (_.contains(AVAILABLE_PROVIDERS, key)) {
          return key;
        };
      });

      this._provider = provider || default_provider;
    }
  }

  get provider() {
    return this._provider;
  }
}
