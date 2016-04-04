import { Manifest } from 'azk/manifest';
import h from 'spec/spec_helper';

describe("Azk manifest class, validate set", function() {
  it("should return blank array for valid manifest", function() {
    return h.mockManifest({}).then((mf) => {
      var valid_errors = mf.validate();

      h.expect(valid_errors).to.instanceof(Array);
      h.expect(valid_errors).to.length(0);
    });
  });

  it("should return invalid manifest with zero systems", function() {
    var app = h.fixture_path('invalids', 'blank');
    var mf  = new Manifest(app);
    var valid_errors = mf.validate();

    h.expect(valid_errors).to.instanceof(Array);
    h.expect(valid_errors[0]).to.have.property("key", "no_system_set");
    h.expect(valid_errors[0]).to.have.property("manifest").and.eql(mf);
    h.expect(valid_errors[0]).to.have.property("level", "warning");
  });

  it("should return deprecate string interpolation that are different #{}", function() {
    var content = `
      system('system1', {
        image: { docker: "any" },
        http : { domains: ["foo.\${azk.default_domain}"] },
        command: ["echo", "\$HTTP_PORT"],
        workdir: "#{manifest.dirname}",
      });
      system('system2', {
        image: { docker: "any" },
        workdir: "\${-manifest.dirname}",
        command: "bundle exec <%=system.name%>",
        mounts: {
          "/azk/\${system.name}": path("./"),
        }
      });
    `;

    return h.mockManifestWithContent(content).then((mf) => {
      var valid_errors = mf.validate();

      h.expect(valid_errors).to.instanceof(Array);
      h.expect(valid_errors).to.length(4);

      var key   = "deprecated_token";
      var level = "deprecate";
      h.expect(valid_errors).to.containSubset([
        {
          key, level,
          original: "${azk.default_domain}", suggestion: "#{azk.default_domain}",
          token_open: "${", token_close: "}", option: "http.domains", system: "system1"
        },
        {
          key, level,
          original: "${-manifest.dirname}", suggestion: "#{manifest.dirname}",
          token_open: "${-", token_close: "}", option: "workdir", system: "system2"
        },
        {
          key, level,
          original: "<%=system.name%>", suggestion: "#{system.name}",
          token_open: "<%=", token_close: "%>", option: "command", system: "system2"
        },
        {
          key, level,
          original: "${system.name}", suggestion: "#{system.name}",
          token_open: "${", token_close: "}", option: "mounts", system: "system2"
        },
      ]);
    });
  });

  it("should return deprecate use http hostname", function() {
    var content = `
      system('system1', {
        image: { docker: "any" },
        http : { hostname: "foo.dev.azk.io" },
      });
    `;

    return h.mockManifestWithContent(content).then((mf) => {
      var valid_errors = mf.validate();

      h.expect(valid_errors).to.instanceof(Array);
      h.expect(valid_errors).to.length(1);

      h.expect(valid_errors[0]).to.have.property("key", "deprecated");
      h.expect(valid_errors[0]).to.have.property("option", "http.hostname");
      h.expect(valid_errors[0]).to.have.property("new_option", "http.domains");
      h.expect(valid_errors[0]).to.have.property("manifest").and.eql(mf);
      h.expect(valid_errors[0]).to.have.property("level", "deprecate");
      h.expect(valid_errors[0]).to.have.property("system", "system1");
    });
  });

  it("should return deprecate use of image", function() {
    var content = `
      system('system1', {
        image: "isDeprecated"
      });
    `;

    return h.mockManifestWithContent(content).then((mf) => {
      var valid_errors = mf.validate();

      h.expect(valid_errors).to.instanceof(Array);
      h.expect(valid_errors).to.length(1);

      h.expect(valid_errors[0]).to.have.property("key", "deprecated");
      h.expect(valid_errors[0]).to.have.property("option", "image");
      h.expect(valid_errors[0]).to.have.property("new_option", "image.provider");
      h.expect(valid_errors[0]).to.have.property("manifest").and.eql(mf);
      h.expect(valid_errors[0]).to.have.property("level", "deprecate");
      h.expect(valid_errors[0]).to.have.property("system", "system1");
    });
  });

  it("should not return deprecate use of image", function() {
    var content = `
      system('system1', {
        image: { docker: "any" }
      });
    `;

    return h.mockManifestWithContent(content).then((mf) => {
      var valid_errors = mf.validate();

      h.expect(valid_errors).to.instanceof(Array);
      h.expect(valid_errors).to.length(0);
    });
  });

});
