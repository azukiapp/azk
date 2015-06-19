import { _, fsAsync, lazy_require } from 'azk';
import { promiseResolve } from 'azk/utils/promises';
import Utils from 'azk/utils';

var lazy = lazy_require({
  createCache: ['fscache', 'createSync'],
});

/**
 * Save meta information * (like database, but more simple)
 *
 * @param {object} options            - Meta options
 * @param {string} options.cached_dir - Directory to persist meta data
 * @param {object} [cache=fscache]    - Cache class
 **/
export class Meta {
  constructor(options, cache = null) {
    this.options = options;
    this.cache   = cache;
  }

  set cache(value) {
    this.__cache = value;
  }

  get cache_dir() {
    return this.options.cache_dir;
  }

  cleanAsync() {
    var path = this.cache_dir;
    return fsAsync.exists(path).then(function(cache_dir_exists) {
      if (cache_dir_exists) {
        this.__cache = null;
        return fsAsync.remove(path);
      }
      return promiseResolve(false);
    }.bind(this));
  }

  get cache() {
    if (!this.__cache) {
      var cache_dir = this.cache_dir;
      fsAsync.mkdirpSync(cache_dir);
      this.__cache = lazy.createCache(cache_dir);
    }
    return this.__cache;
  }

  getOrSet(key, defaultValue) {
    var value = this.cache.getSync(key);
    if (_.isUndefined(value) && defaultValue) {
      value = defaultValue;
      this.set(key, value);
    }
    return value;
  }

  get(key, defaultValue) {
    var value = this.cache.getSync(key);
    return value !== undefined ? value : defaultValue;
  }

  set(key, value) {
    this.cache.putSync(key, value);
    return this;
  }

  del(key) {
    return this.cache.delSync(key);
  }
}

export class FakeCache {
  constructor() {
    this.values = {};
  }

  clean() {
    this.values = {};
  }

  keyCalc(key) {
    return Utils.calculateHash(JSON.stringify(key));
  }

  getSync(key) {
    return this.values[this.keyCalc(key)];
  }

  putSync(key, value) {
    this.values[this.keyCalc(key)] = value;
  }

  delSync(key) {
    delete this.values[this.keyCalc(key)];
  }
}
