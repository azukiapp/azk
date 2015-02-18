import { _, fs, async, defer, lazy_require, t, path, isBlank } from 'azk';
import { ManifestError } from 'azk/utils/errors';
import Utils from 'azk/utils';

var AVAILABLE_PROVIDERS = ["docker", "dockerfile"];
var default_tag      = "latest";

/* global DImage, docker */
lazy_require(this, {
  DImage: ['azk/docker', 'Image'],
  docker: ['azk/docker', 'default'],
});

export class Image {
  constructor(options) {
    this.system = options.system || { image_name_suggest: null };

    // Extract provider information
    // 2. i.e.: { docker: 'azukiapp/azktcl:0.0.2' }
    // 3. i.e.: { provider: 'dockerfile', repository: 'azukiapp/azktcl' }
    this.provider = this._parse_provider(options);

    if (options.hasOwnProperty(this.provider)) {
      if (this.provider === 'docker') {
        this.name = options[this.provider];
      } else if (this.provider === 'dockerfile') {
        this.path = options[this.provider];
      }
    } else {
      if (this.provider === 'dockerfile') {
        this.path = options.path;
      }
      this.repository = options.repository;
      this.tag        = this.tag || options.tag || default_tag;
    }

    if (_.isEmpty(this.name)) {
      this.name = `${this.system.image_name_suggest}:${this.tag}`;
    }
  }

  check() {
    return defer((_resolve, _reject, notify) => {
      notify({ type: "action", context: "image", action: "check_image" });
      return docker.findImage(this.name);
    });
  }

  pull(options, stdout) {
    return async(this, function* (notify) {
      // split docker namespace and docker repository
      var namespace   = '';
      var repository  = '';
      var splited = this.repository.split('\/');
      if (splited.length === 2) {
        namespace   = splited[0];
        repository  = splited[1];
      } else {
        namespace   = 'library';
        repository  = this.repository;
      }

      // check if exists local image
      this.repository = namespace + '/' + repository;
      var image = yield this.check();

      // check official docker image without "library/" namespace
      if (isBlank(image) && namespace === 'library') {
        this.repository = repository;
        image = yield this.check();
      }

      // download from registry
      if (isBlank(image)) {
        this.repository = namespace + '/' + repository;
        notify({ type: "action", context: "image", action: "pull_image", data: this });

        //yield this.pullWithDockerRegistryDownloader(docker.modem, namespace, repository, this.tag);

        // old implementation of pull
        image = yield docker.pull(this.repository, this.tag, _.isObject(stdout) ? stdout : null);
      }
      return yield this.check();
    });
  }

  // FIXME: save files inside VM or elsewhere
  // pullWithDockerRegistryDownloader(dockerode_modem, namespace, repository, repo_tag) {
  //   return async(this, function* () {
  //     var DockerHub   = require('docker-registry-downloader').DockerHub;
  //     var Syncronizer = require('docker-registry-downloader').Syncronizer;
  //     var dockerHub   = new DockerHub();
  //     var syncronizer = new Syncronizer({ dockerode_modem: dockerode_modem });
  //     var tag         = repo_tag;

  //     // get token from DOCKER HUB API
  //     return dockerHub.images(namespace, repository).then(function(hubResult) {
  //       // sync registry layer with local layers
  //       return syncronizer.sync(hubResult, tag);
  //     });

  //   });
  // }

  build(options) {
    return async(this, function* (notify) {
      var image = yield this.check();
      if (options.build_force || isBlank(image)) {
        notify({ type: 'action', context: 'image', action: 'build_image', data: this });
        image = yield docker.build({ dockerfile: this.path, tag: this.name });
      }
      return image;
    });
  }

  set path(dockerfile) {
    this._path = this._findDockerfile(dockerfile);
    this.tag   = Utils.calculateHash(dockerfile);
  }

  _findDockerfile(dockerfile_path, require_file = false) {
    var exists = fs.existsSync(dockerfile_path);

    if (exists) {
      var stats = fs.statSync(dockerfile_path);
      var isDirectory = stats.isDirectory();

      if (!isDirectory) {
        return dockerfile_path;
      } else if (isDirectory && !require_file) {

        // it is a folder - try find the manifesto
        dockerfile_path = path.join(dockerfile_path, 'Dockerfile');
        return this._findDockerfile(dockerfile_path, true);
      }
    }

    var msg = t("manifest.cannot_find_dockerfile", {system: this.system.name});
    throw new ManifestError('', msg);
  }

  get path() {
    return this._path;
  }

  set name(value) {
    if (!value) {
      return;
    }

    var imageParsed = DImage.parseRepositoryTag(value);
    this.repository = imageParsed.repository;
    this.tag        = imageParsed.tag || default_tag;
  }

  get name() {
    if (this.repository && this.tag) {
      return `${this.repository}:${this.tag}`;
    }
  }

  get full_name() {
    return `{ ${this.provider}: "${this.repository}:${this.tag}" }`;
  }

  _parse_provider(options) {
    var provider = null;

    var hasProvider = options.hasOwnProperty('provider');
    if (hasProvider) {
      // 1. ie: { provider: "docker" }
      if (_.contains(AVAILABLE_PROVIDERS, options.provider)) {
        provider = options.provider;
      }
    } else {
      // try find provider in image keys
      // 2. ie: { docker: "[image]" }
      var options_keys = _.keys(options);
      if (options_keys.length > 0) {
        provider = _.find(options_keys, function(key) {
          if (_.contains(AVAILABLE_PROVIDERS, key)) {
            return key;
          }
        });
      }
    }

    if (_.isEmpty(provider)) {
      // Error: cant find any provider
      var wrongProvider_name = options.provider || '';
      var msg = t("manifest.provider_invalid", { wrongProvider: wrongProvider_name });
      throw new ManifestError('', msg);
    }

    return provider;
  }
}
