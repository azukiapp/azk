import { _, fs, t, path, isBlank, lazy_require } from 'azk';
import { publish } from 'azk/utils/postal';
import { async, defer } from 'azk/utils/promises';
import { ManifestError, NoInternetConnection, LostInternetConnection } from 'azk/utils/errors';
import { net } from 'azk/utils';
import Utils from 'azk/utils';
import { default as tracker } from 'azk/utils/tracker';

var AVAILABLE_PROVIDERS = ["docker", "dockerfile"];
var default_tag      = "latest";

var lazy = lazy_require({
  DImage: ['azk/docker', 'Image'],
  docker: ['azk/docker', 'default'],
  Syncronizer: ['docker-registry-downloader'],
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
    return defer(() => {
      publish("image.check.status", { type: "action", context: "image", action: "check_image" });
      return lazy.docker.findImage(this.name);
    });
  }

  pull(options, stdout) {
    return async(this, function* () {
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
      if (isBlank(image) || options.build_force) {
        this.repository = namespace + '/' + repository;
        publish("image.pull.status", { type: "action", context: "image", action: "pull_image", data: this });

        var registry_result;
        var output;

        var currentOnline = yield net.isOnlineCheck();
        if ( !currentOnline ) {
          throw new NoInternetConnection();
        }

        // get size and layers count
        try {
          registry_result = yield this.getDownloadInfo(
            lazy.docker.modem,
            namespace,
            repository,
            this.tag);

          output = _.isObject(stdout) && stdout;
          // docker pull
          image = yield lazy.docker.pull(this.repository, this.tag, output, registry_result);
        } catch (err) {
          output = (err || '').toString();
          throw new LostInternetConnection('  ' + output);
        }

        yield this._track('pull');
      }
      return this.check();
    });
  }

  getDownloadInfo(dockerode_modem, namespace, repository, repo_tag) {
    return async(this, function* () {

      var docker_socket   = { dockerode_modem: dockerode_modem };
      var request_options = {
        timeout: 10000,
        maxAttempts: 3,
        retryDelay: 500
      };

      var syncronizer = new lazy.Syncronizer(docker_socket, request_options);
      yield syncronizer.initialize();
      var tag = repo_tag;

      // get token from Docker Hub
      var registry_infos;
      var hubResult;
      var getLayersDiff_result;

      hubResult = yield syncronizer.dockerHub.images(namespace, repository);

      // Get layers diff
      getLayersDiff_result = yield syncronizer.getLayersDiff(hubResult, tag);

      // Check what layer we do not have locally
      var registry_layers_ids       = getLayersDiff_result.registry_layers_ids;
      var non_existent_locally_ids  = getLayersDiff_result.non_existent_locally_ids;

      registry_infos = {
        registry_layers_ids_count      : registry_layers_ids.length,
        non_existent_locally_ids_count : non_existent_locally_ids.length
      };

      publish("image.getDownloadInfo.status", {
        type       : "pull_msg",
        traslation : "commands.helpers.pull.pull_getLayersDiff",
        data       : registry_infos
      });

      return registry_infos;
    });
  }

  build(options) {
    return async(this, function* () {
      var image = yield this.check();
      if (options.build_force || isBlank(image)) {
        publish("image.build.status",
          { type: 'action', context: 'image', action: 'build_image', data: this });
        image = yield lazy.docker.build({
                                    dockerfile: this.path,
                                    tag: this.name,
                                    verbose: options.provision_verbose,
                                    stdout: options.stdout
                                  });
      }
      yield this._track('build');
      return image;
    });
  }

  set path(dockerfile) {
    this._path = this._findDockerfile(dockerfile);
    this.tag   = Utils.calculateHash(dockerfile);
  }

  _findDockerfile(dockerfile_path) {
    var msg;

    if (this.system.hasOwnProperty('manifest') && this.system.manifest.cwd) {
      var dockerfile_cwd = path.resolve(this.system.manifest.cwd, dockerfile_path);
      // to change this `Sync` codes we have to change system and image contructors
      // there is no way to call promises on contructors
      // new system -> new image -> set path -> _findDockerfile -> sync calls
      var exists = fs.existsSync(dockerfile_cwd);

      if (exists) {
        var stats = fs.statSync(dockerfile_cwd);
        var isDirectory = stats.isDirectory();

        if (isDirectory) {
          // it is a folder - try find the manifest
          dockerfile_cwd = path.join(dockerfile_cwd, 'Dockerfile');
          exists = fs.existsSync(dockerfile_cwd);

          if (!exists) {
            var translate_options = { system: this.system.name, dockerfile: dockerfile_path };
            msg = t("manifest.cannot_find_dockerfile", translate_options);
            throw new ManifestError('', msg);
          }
        }

        return dockerfile_cwd;
      }
      msg = t("manifest.cannot_find_dockerfile_path", { system: this.system.name, dockerfile: dockerfile_path });
      throw new ManifestError('', msg);
    } else {
      msg = t("manifest.required_path");
      throw new Error(msg);
    }
  }

  get path() {
    return this._path;
  }

  set name(value) {
    if (!value) {
      return;
    }

    var imageParsed = lazy.DImage.parseRepositoryTag(value);
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

  //
  // Tracker
  //
  _track(event_type_name) {
    return tracker.sendEvent("image", (trackerEvent) => {
      // get event_type
      trackerEvent.addData({
        event_type: event_type_name,
        manifest_id: this.system.manifest.namespace
      });

      // build repo name as `[repo]:[tag]`
      var repo_full_name = this.repository;
      if (this.tag) {
        repo_full_name = repo_full_name + ':' + this.tag;
      }

      // set default image type
      var image_part = {
        image: {
          type: this.provider
        }
      };

      // get repository only if it is public
      if (this.provider === 'docker') {
        image_part.image.name = repo_full_name;
      }

      // add image object to tracker data
      trackerEvent.addData(image_part);
    });
  }

}
