import { _, t, config } from 'azk';
import { Image } from 'azk/images';

export class System {
  constructor(manifest, name, image, options = {}) {
    this.manifest = manifest;
    this.name     = name;
    this.image    = new Image(image);
    this.options  = _.merge({}, this.default_options, options);
    this.options  = this._expand_template(this.options);
  }

  get default_options() {
    var msg = t("system.cmd_not_set", {system: this.name});
    return {
      command: `echo "${msg}"; exit 1`,
      depends: [],
    }
  }

  // Get options
  get command() { return this.options.command };
  get raw_mount_folders() { return this.options.mount_folders };
  get namespace() {
    return this.manifest.namespace + '-sys.' + this.name;
  }

  // Get depends info
  get depends() { return this.options.depends };
  get dependsInstances() {
    return _.map(this.depends, (depend) => {
      return this.manifest.system(depend, true);
    });
  };

  _expand_template(options) {
    var data = {
      system: {
        name: this.name,
        persistent_folders: "/data",
      },
      manifest: {
        dir: this.manifest.manifestDirName,
        project_name: this.manifest.manifestDirName,
      },
      azk: {
        default_domain: config('agent:balancer:host'),
        balancer_port: config('agent:balancer:port'),
        balancer_ip: config('agent:balancer:ip'),
      }
    };
    return JSON.parse(_.template(JSON.stringify(options), data));
  }
}
