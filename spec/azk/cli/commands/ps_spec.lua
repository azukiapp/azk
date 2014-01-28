local hh    = require('spec.spec_helper')
local azk   = require('azk')
local app   = require('azk.app')
local shell = require('azk.cli.shell')
local utils = require('azk.utils')
local fs    = require('azk.utils.fs')

local path    = azk.path
local command = require('azk.cli.commands.ps')

describe("Azk #cli #commandps", function()
  local i18n_f      = azk.i18n.module("command_ps")
  local i18n_app_f  = azk.i18n.module("app")

  after_each(function()
    hh.remove_test_images()
  end)

  it("should require azkfile.json", function()
    local project = utils.tmp_dir()
    fs.cd(project, function()
      local output = shell.capture_io(function()
        command.run("any")
      end)

      local msg = i18n_app_f("no_such", { file = azk.manifest })
      assert.has_log("error", msg, output.stderr)
    end)
  end)

  describe("in valid application", function()
    local tmp_dir = hh.tmp_dir()
    local project = path.join(tmp_dir, 'project')
    local box     = path.join(tmp_dir, 'test-box')
    local images = {}

    setup(function()
      fs.mkdir(project)
      fs.cp_r(
        hh.fixture_path("base_azkfile.json"),
        path.join(project, azk.manifest)
      )
      fs.cp_r(hh.fixture_path("test-box"), box)
    end)

    it("should show a erro if image not provision", function()
      local _, app_data = app.new(project)
      fs.cd(project, function()
        local output = shell.capture_io(function()
          command.run()
        end)

        assert.has_log("error", i18n_f("not_provision"), output.stderr)
      end)
    end)

    pending("should list current process for application", function()
    end)
  end)
end)

