import { async, defer, _, lazy_require, t, path } from 'azk';
import { ManifestError } from 'azk/utils/errors';
import Utils from 'azk/utils';

var qfs = require('q-io/fs');

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

    if (image.hasOwnProperty("skip_check_dockerfile")) {
      this.skip_check_dockerfile = image.skip_check_dockerfile;
    }

    this.parse_provider(image);
    if (image.hasOwnProperty(this.provider)) {
      // 2. i.e.: { docker: 'azukiapp/azktcl:0.0.2' }
      if (this.provider === 'docker') {
        this.name = image[this.provider];
      } else if (this.provider === 'dockerfile') {
        this.path = image[this.provider];
      }
    } else {
      // 3. i.e.: { provider: 'dockerfile', repository: 'azukiapp/azktcl' }
      this.repository = image.repository;
      this.tag        = image.tag || default_tag;

      if (this.provider === 'dockerfile') {
        this.path       = image.path;
      } else {
        this.name       = image.name;
      }
    }
  }

  check() {
    return defer((_resolve, _reject, notify) => {
      notify({ type: "action", context: "image", action: "check_image" });
      return docker.findImage(this.name);
    });
  }

  pull(options, stdout) {
    var options = options || {};
    return async(this, function* (notify) {
      // split docker namespace and docker repository
      var namespace   = '';
      var repository  = '';
      var splited = this.repository.split('\/');
      if (splited.length === 2) {
        namespace   = splited[0];
        repository  = splited[1];
      }
      else {
        namespace   = 'library';
        repository  = this.repository;
      }

      // check if exists local image
      this.repository = namespace + '/' + repository;
      var image = yield this.check();

      // check official docker image without "library/" namespace
      if (image === null && namespace === 'library') {
        this.repository = repository;
        image = yield this.check();
      }

      // download from registry
      if (image === null) {
        this.repository = namespace + '/' + repository;
        notify({ type: "action", context: "image", action: "pull_image", data: this });

        yield this.pullWithDockerRegistryDownloader(docker.modem, namespace, repository, this.tag);

        // old implementation of pull
        // image = yield docker.pull(this.repository, this.tag, _.isObject(stdout) ? stdout : null);
      }
      return yield this.check();
    });
  }

  pullWithDockerRegistryDownloader(dockerode_modem, namespace, repository, repo_tag) {
    return async(this, function* (notify) {
      var DockerHub   = require('docker-registry-downloader').DockerHub;
      var Syncronizer = require('docker-registry-downloader').Syncronizer;
      var dockerHub   = new DockerHub();
      var syncronizer = new Syncronizer({ dockerode_modem: dockerode_modem });
      var tag         = repo_tag;

      // get token from DOCKER HUB API
      return dockerHub.images(namespace, repository).then(function(hubResult) {
        // sync registry layer with local layers
        return syncronizer.sync(hubResult, tag);
      });

    });
  }

  build(options, stdout) {
    var options = options || {};
    return async(this, function* (notify) {
      var image = yield this.check();
      if (options.build_force || image === null) {
        notify({ type: 'action', context: 'image', action: 'build_image', data: this });
        image = yield docker.build(this, _.isObject(stdout) ? stdout : null);
      }
      return image;
    });
  }

  set path(dockerfile_path) {
    if (!dockerfile_path) {
      return null;
    } else if (this.skip_check_dockerfile) {
      return this._path  = dockerfile_path;
    }

    return async(this, function* () {
      var exists = yield qfs.exists(dockerfile_path);

      if (exists) {
        var stats = yield qfs.stat(dockerfile_path);
        var isDirectory = stats.isDirectory();

        if(isDirectory) {
          // it is a folder - try find the manifesto
          dockerfile_path = path.join(dockerfile_path, 'Dockerfile');
          exists = yield qfs.exists(dockerfile_path);

          if(!exists){
            var msg = t("manifest.can_find_dockerfile", {system: 'systemName FIXME'});
            throw new ManifestError('', msg);
          }
        }

        var dockerfileHash = yield Utils.calculateHash(dockerfile_path);

        this.tag    = dockerfileHash
        this._path  = dockerfile_path;
      }
    });
  }

  get path() {
    return this._path;
  }

  set name(value) {
    if(!value){
      return;
    }

    var imageParsed = DImage.parseRepositoryTag(value);
    this.repository = imageParsed.repository;
    this.tag        = imageParsed.tag      || default_tag;
  }

  get name() {
    if (this.repository && this.tag) {
      return `${this.repository}:${this.tag}`;
    };
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
