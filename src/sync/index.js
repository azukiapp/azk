import { _, defer, log, path } from 'azk';

// Module
var Sync = {
  sync(origin, destination, opts = {}) {
    var shell   = opts.ssh ? `ssh ${opts.ssh.opts}` : '/bin/bash';
    destination = opts.ssh ? `${opts.ssh.url}:${destination}` : destination;

    var r = new require('rsync')()
      .shell(shell)
      .flags('az')
      .set('delete')
      .source(path.join(origin, '/'))
      .destination(destination);

    if (opts.include) {
      r.include(this._process_include(opts.include));
      r.exclude(['*/', '*']);
    } else {
      if (opts.except) { r.exclude(opts.except) }
      if (opts.except_from) {
        r.set('exclude-from', path.resolve(origin, opts.except_from));
      }
    }

    return defer((resolve, reject) => {
      r.execute(function(err, code, cmd) {
        log.debug('SSH Command: ', cmd);
        return err ? reject({ err, code }) : resolve(code);
      });
    });
  },

  _process_include(include) {
    if (!_.isArray(include)) { include = [include]; }

    var includes = [];
    _.each(include, (include) => {
      _.reduce(include.split('/'), (acc, p) => {
        if (acc === include) { return acc; }
        acc = acc.concat(p) === include ? acc.concat(p) : acc.concat(path.join(p, '/'));
        includes.push(acc);
        return acc;
      }, '');
    });

    return includes;
  }

};

export { Sync };
