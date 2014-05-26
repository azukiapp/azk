import h from 'spec/spec_helper';
import { config } from 'azk';
import { get, set } from 'azk/config';

describe("azk config module", function() {
  // Not change env in test
  var env = config('env');
  afterEach(() => set('env', env));

  it("should get a env key", function() {
    h.expect(config('env')).to.equal('test');
    h.expect(get('env')).to.equal('test');
  });

  describe("set call", function() {
    it("should set a env key", function() {
      set('env', 'production');
      h.expect(get('env')).to.equal('production');
    });

    it("should defines an arbitrary key", function() {
      set('env', 'test_set');
      set('any:foo', 'bar');
      h.expect(get('any:foo')).to.equal('bar');
    });

    it("should merge a not defined env with a global", function() {
      var default_root = get('paths:azk_root');
      var default_data = get('paths:data');

      set('env', 'not_seted');
      set('paths:data', __dirname);
      h.expect(get('paths:data')).to.equal(__dirname);
      h.expect(get('paths:azk_root')).to.equal(default_root);

      set('env', env);
      h.expect(get('paths:data')).to.equal(default_data);
    });
  });
});
