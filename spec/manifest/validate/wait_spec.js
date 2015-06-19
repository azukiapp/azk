import h from 'spec/spec_helper';

// TODO: - [ ] parser azk-manifest: check all this validation with a javascript parser
// TODO: - [ ] parser azk-manifest: show line and column numbers
// TODO: - [ ] parser azk-manifest: show a syntax hightlighted source code of manifest
describe('Validate manifest option - wait:', function () {

  // TODO: - [ ] extract check_valid to a new spec_helper extension
  var check_valid = function (manifest_content) {
    return h.mockManifestWithContent(manifest_content).then((mf) => {
      var err = mf.validate();
      h.expect(err).to.instanceof(Array);
      h.expect(err).to.length(0);
    });
  };

  // TODO: - [ ] extract check_errors to a new spec_helper extension
  var check_errors = function (manifest_content) {
    return h.mockManifestWithContent(manifest_content).then((mf) => {
      var err = mf.validate();
      h.expect(err).to.instanceof(Array);
      h.expect(err).to.have.length.above(0);
      return err;
    });
  };

  describe('valid:', function () {

    it('should accept positive numbers', function () {
      return check_valid(`
        system('system1', {
          image: { docker: "any" },
          wait: 20,
        });
      `);
    });

    it('should accept wait object', function () {
      return check_valid(`
        system('system1', {
          image: { docker: "any" },
          wait: { retry: 10, timeout: 2000 },
        });
      `);
    });

  });

  describe('invalid', function () {

    describe('simple value:', function () {

      it('should when invalid should get all correct properties on error', function () {
        return check_errors(`
          system('system1', {
            image: { docker: "any" },
            wait: -1,
          });
        `).then((val_errors) => {
          h.expect(val_errors[0]).to.have.property("option", 'wait');
          h.expect(val_errors[0]).to.have.property("value", -1);
          h.expect(val_errors[0]).to.have.property("system_name", 'system1');
          h.expect(val_errors[0]).to.have.property("docs_url", 'http://docs.azk.io/en/reference/azkfilejs/wait.html');
          h.expect(val_errors[0]).to.have.property("level", 'fail');
          h.expect(val_errors[0]).to.have.property("key", 'invalid_option_value');
        });
      });

      it('should not accept zero', function () {
        return check_errors(`
          system('system1', {
            image: { docker: "any" },
            wait: 0,
          });
        `).then((val_errors) => {
          h.expect(val_errors[0]).to.have.property("option", 'wait');
          h.expect(val_errors[0]).to.have.property("key", 'invalid_option_value');
        });
      });

      it('should not accept negative numbers', function () {
        return check_errors(`
          system('system1', {
            image: { docker: "any" },
            wait: 0,
          });
        `).then((val_errors) => {
          h.expect(val_errors[0]).to.have.property("option", 'wait');
          h.expect(val_errors[0]).to.have.property("key", 'invalid_option_value');
        });
      });

      it('should not accept strings', function () {
        return check_errors(`
          system('system1', {
            image: { docker: "any" },
            wait: '1',
          });
        `).then((val_errors) => {
          h.expect(val_errors[0]).to.have.property("option", 'wait');
          h.expect(val_errors[0]).to.have.property("key", 'invalid_option_type');
        });
      });

    });

    describe('object:', function () {

      it('should check retry for valid number', function () {
        return check_errors(`
          system('system1', {
            image: { docker: "any" },
            wait: { retry: -1, timeout: 2000 },
          });
        `).then((val_errors) => {
          h.expect(val_errors[0]).to.have.property("option", 'wait.retry');
          h.expect(val_errors[0]).to.have.property("key", 'invalid_option_value');
        });
      });

      it('should check retry for valid type', function () {
        return check_errors(`
          system('system1', {
            image: { docker: "any" },
            wait: { retry: '1', timeout: 2000 },
          });
        `).then((val_errors) => {
          h.expect(val_errors[0]).to.have.property("option", 'wait.retry');
          h.expect(val_errors[0]).to.have.property("key", 'invalid_option_type');
        });
      });

      it('should check timeout for valid number', function () {
        return check_errors(`
          system('system1', {
            image: { docker: "any" },
            wait: { retry: 1, timeout: -20 },
          });
        `).then((val_errors) => {
          h.expect(val_errors[0]).to.have.property("option", 'wait.timeout');
          h.expect(val_errors[0]).to.have.property("key", 'invalid_option_value');
        });
      });

      it('should check timeout for valid type', function () {
        return check_errors(`
          system('system1', {
            image: { docker: "any" },
            wait: { retry: 1, timeout: '2000' },
          });
        `).then((val_errors) => {
          h.expect(val_errors[0]).to.have.property("option", 'wait.timeout');
          h.expect(val_errors[0]).to.have.property("key", 'invalid_option_type');
        });
      });

    });

  });

});
