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

        yield this.pullWithDockerRegistryDownloader(docker.modem.socketPath, namespace, repository, this.tag);

        // old implementation of pull
        // image = yield docker.pull(this.repository, this.tag, _.isObject(stdout) ? stdout : null);
      }
      return yield this.check();
    });
  }

  pullWithDockerRegistryDownloader(socketPath, namespace, repository, repo_tag) {
    return async(this, function* (notify) {
      var DockerHub   = require('docker-registry-downloader').DockerHub;
      var Syncronizer = require('docker-registry-downloader').Syncronizer;
      var dockerHub   = new DockerHub();
      var syncronizer = new Syncronizer(socketPath);

      var tag         = repo_tag;
      var outputPath  = '/tmp'; // this folder must exist

      // get token from DOCKER HUB API
      return dockerHub.images(namespace, repository).then(function(hubResult) {
        // sync registry layer with local layers
        return syncronizer.sync(hubResult, tag, outputPath);
      });

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
