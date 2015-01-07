import { async, defer, _, lazy_require, t } from 'azk';
import { ManifestError } from 'azk/utils/errors';

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

    if (_.isString(image)) {
      // 1. i.e.: 'azukiapp/azktcl:0.0.2' (deprecated)
      this.isDeprecated = true;
      this.provider = default_provider;
      this.name = image;
      return null;
    }

    this.parse_provider(image);
    if (image.hasOwnProperty(this.provider)) {
      // 2. i.e.: { docker: 'azukiapp/azktcl:0.0.2' }
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
  }

  get name() {
    return `${this.repository}:${this.tag}`;
  }

  get full_name() {
    return `{ ${this.provider}: "${this.repository}:${this.tag}" }`;
  }

  parse_provider(image) {
    var hasProvider = image.hasOwnProperty('provider');
    if(hasProvider) {
      if (_.contains(AVAILABLE_PROVIDERS, image.provider)) {
        return this.provider = image.provider;
      }
    }

    // try find provider in image keys
    var image_keys = _.keys(image);
    if(image_keys.length > 0) {
      var provider = _.find(image_keys, function(key) {
        if (_.contains(AVAILABLE_PROVIDERS, key)) {
          return key;
        }
      });
      if(provider) {
        return this.provider = provider;
      }
    }

    // Error: cant find any provider
    var wrongProvider_name = image.provider || '';
    var msg = t("manifest.provider_invalid", { wrongProvider: wrongProvider_name });
    throw new ManifestError('', msg);
  }
}
