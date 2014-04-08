import { Q, pp, unders as _ } from 'azk';
import Utils from 'azk/utils';

export class Image extends Utils.qify('dockerode/lib/image') {
  constructor(modem, name) {
    super(modem, name);
  }
}
export class Container extends Utils.qify('dockerode/lib/container') {}

export class Docker extends Utils.qify('dockerode') {
  constructor(opts) {
    console.log("Connect %s:%s", opts.host, opts.port);
    super(opts);
  }

  getImage(name) {
    return new Image(this.modem, name);
  }

  getContainer(id) {
    return new Container(this.modem, id);
  }

  findImage(name) {
    return this.getImage(name).inspect()
      .then(
        (_data) => { return this.getImage(name); },
        (err  ) => {
          if (err.statusCode == 404)
            return null;
          throw err;
        }
      );
  }
}
