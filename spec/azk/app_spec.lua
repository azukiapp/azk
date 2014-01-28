local hh     = require('spec.spec_helper')
local utils  = require('azk.utils')
local fs     = require('azk.utils.fs')
local path   = require('azk.utils.path')
local shell  = require('azk.cli.shell')
local luker  = require('luker')
local tablex = require('pl.tablex')

local azk = require('azk')
local app = require('azk.app')

local i18n_f = azk.i18n.module("app")
local i18n_service_f = azk.i18n.module("service")

describe("Azk #app current", function()
  describe("in valid a 'azk app' folder", function()
    local base_dir = hh.tmp_dir()
    local box_dir  = path.join(base_dir, "test-box")
    local app_dir  = path.join(base_dir, "app")

    setup(function()
      fs.mkdir(app_dir)
      fs.cp_r(hh.fixture_path("test-box"), box_dir)
      fs.cp_r(
        hh.fixture_path("full_azkfile.json"),
        path.join(app_dir, azk.manifest)
      )
    end)

    before_each(function()
      azk.debug = false
    end)

    after_each(function()
      hh.remove_test_images()
    end)

    teardown(function()
      azk.debug = true
      fs.rm_rf(base_dir)
    end)

    it("should return a new app id", function()
      local id = app.new_id()
      assert.is.equal(15, #id)
      assert.is.match(id, "^[0-9a-f]+$")
    end)

    it("should return a manifest", function()
      local result, file = app.find_manifest(app_dir)
      assert.is_true(result)
      assert.is.equal(path.join(app_dir, azk.manifest), file)
    end)

    it("should find manifest in tree", function()
      local _, file   = app.find_manifest(box_dir)
      local _, finded = app.find_manifest(
        path.join(box_dir, "scripts")
      )
      assert.is.equal(file, finded)
    end)

    it("should return not found manifest", function()
      local project = utils.tmp_dir()
      local result, file, err = app.find_manifest(project)

      assert.is_false(result)
      assert.is.blank(file)
      assert.is.match(err, hh.er(
        i18n_f("no_such", { file = azk.manifest })
      ))
    end)

    it("should find manifest and parse then", function()
      local id = "def73023f3b54e5"
      local result, data = app.new(app_dir)
      assert.is_true(result)
      assert.is.equal(id, data.id)
      assert.is.equal("azk/apps/" .. id, data.repository)
      assert.is.equal("azk/apps/" .. id .. ":latest", data.image)
      assert.is.equal(app_dir, data.path)
      assert.is.equal("../test-box", data.content.box)
      assert.is.equal(box_dir, data.from.path)
    end)

    it("should parse box manifest", function()
      local result, data = app.new(box_dir)
      assert.is_true(result)
      assert.is.equal("ubuntu:12.04", data.from.image)
    end)

    it("should execute a command in app image", function()
      local result, data = app.new(app_dir)
      data["image"] = "ubuntu:12.04" -- Fake image

      local output = shell.capture_io(function()
        return app.run(data, "/bin/bash", "-c", "ls -l")
      end)

      assert.is_true(output.result)
      assert.is.match(output.stdout, "total 2")
      assert.is.match(output.stdout, azk.manifest)
    end)

    describe("with services", function()
      local data = nil

      setup(function()
        fs.cp_r(
          hh.fixture_path("base_azkfile.json"),
          path.join(app_dir, azk.manifest)
        )
        local result, _data = app.new(app_dir)
        data = _data
        data["image"] = "ubuntu:12.04" -- Fake image
      end)

      after_each(function()
        fs.rm_rf(path.join(data.work_path, "services"))
      end)

      it("should return a error if note a service", function()
        local result, err = pcall(app.service, data, "not", "status")

        assert.is_false(result)
        assert.is.equal(i18n_service_f("not_service", { service = "not" }), err.msg)
      end)

      it("should start a service with a name", function()
        local result = app.service(data, "web", "start")
        local status, containers = app.service(data, "web", "status")

        assert.is.equal(1, #containers)
        assert.is.equal(data.image, containers[1].Image)
      end)

      it("should get service status by name", function()
        local result = app.service(data, "worker", "start")
        local output = shell.capture_io(function()
          azk.debug = true
          return app.service(data, "worker", "status")
        end)

        local status, containers = app.service(data, "worker", "status")
        assert.is.equal(1, #containers)
        assert.is.equal(data.image, containers[1].Image)
        assert.has_log("info", i18n_service_f("running", { instances = 1 }), output.stderr)
      end)

      it("should scale service to a numer of process", function()
        local output = shell.capture_io(function()
          azk.debug = true
          app.service(data, "worker", "start", { number = 2 })
        end)
        local status, containers = app.service(data, "worker", "status")

        local msg = i18n_service_f("scale", {
          service = "worker",
          from = 0,
          to   = 2
        })

        assert.has_log("info", msg, output.stderr)

        assert.is.equal(2, #containers)
        assert.is.equal(data.image, containers[1].Image)

        local output = shell.capture_io(function()
          azk.debug = true
          app.service(data, "worker", "scale", { number = 1 })
        end)
        local status, containers = app.service(data, "worker", "status")

        local msg = i18n_service_f("scale", {
          service = "worker",
          from = 2,
          to   = 1
        })

        assert.has_log("info", msg, output.stderr)

        assert.is.equal(1, #containers)
        assert.is.equal(data.image, containers[1].Image)
      end)

      it("should scale to zero or stop", function()
        app.service(data, "worker", "start", { number = 2 })
        local status, containers = app.service(data, "worker", "status")

        assert.is.equal(2, #containers)

        app.service(data, "worker", "stop")
        local status, containers = app.service(data, "worker", "status")

        assert.is.equal(0, #containers)
      end)

      it("should log in working directory", function()
        local result = app.service(data, "web", "start", { number = 2 })
        local status, containers = app.service(data, "web", "status")

        assert.is.equal(2, #containers)

        local log = fs.read(path.join(data.work_path, "services", "web.log"))
        assert.is.match(log, ("AZK_NAME=%s%%.service%%."):format(data.id))
        assert.is.match(log, "ENV_VAR=DEV" )
        assert.is.match(log, "SERVICE_VAR=foobar" )
      end)

      it("should map port if web service", function()
        local result = app.service(data, "web", "start")
        local status, containers = app.service(data, "web", "status")
        assert.is.equal(1, #containers)

        local port = containers[1].Ports[1]

        assert.is.equal(8080, port.PrivatePort)
        assert.is.equal("tcp", port.Type)
      end)
    end)
  end)
end)
