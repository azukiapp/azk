import { _, fs, t, path, isBlank, lazy_require } from 'azk';
import { publish } from 'azk/utils/postal';
import { async } from 'azk/utils/promises';
import { ManifestError, NoInternetConnection } from 'azk/utils/errors';
import { net } from 'azk/utils';
import Utils from 'azk/utils';
import { default as tracker } from 'azk/utils/tracker';

const AVAILABLE_PROVIDERS = ["docker", "dockerfile"];
const DEFAULT_TAG = "latest";

var lazy = lazy_require({
  DImage     : ['azk/docker', 'Image'],
  docker     : ['azk/docker', 'default'],
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
      this.tag        = this.tag || options.tag || DEFAULT_TAG;
    }

    if (_.isEmpty(this.name)) {
      this.name = `${this.system.image_name_suggest}:${this.tag}`;
    }
  }

  check(notify = true) {
    if (notify) {
      publish("image.check.status", {
        type: "action", context: "image", action: "check_image"
      });
    }
    return lazy.docker.findImage(this.name);
  }

  pullOrBuild(options) {
    return (this.provider === "dockerfile") ? this.build(options) : this.pull(options);
  }

  checkOrGet(options, force = false) {
    if (force) {
      return this.pullOrBuild(options);
    } else {
      return this.check().then((image) => {
        return (isBlank(image)) ? this.checkOrGet(options, true) : image;
      });
    }
  }

  pull() {
    return async(this, function* () {
      publish("image.pull.status", {
        type: "action", context: "image", action: "pull_image", data: this
      });

      // Check is online before try pull
      var currentOnline = yield net.isOnlineCheck();
      if ( !currentOnline ) {
        throw new NoInternetConnection();
      }

      yield this._track('pull');
      yield lazy.docker.pull(this.repository, this.tag);

      return this.check(false);
    });
  }

  build(options) {
    return async(this, function* () {
      publish("image.build.status", {
        type: 'action', context: 'image', action: 'build_image', data: this
      });

      let build_opts = {
        dockerfile: this.path,
        tag: this.name,
        verbose: options.provision_verbose,
        stdout: options.stdout
      };

      yield lazy.docker.build(build_opts);
      yield this._track('build');

      return this.check(false);
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
      // FIXME: to change this `Sync` codes we have to change system and image contructors
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
    this.tag        = imageParsed.tag || DEFAULT_TAG;
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

  // Tracker pull and build
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
