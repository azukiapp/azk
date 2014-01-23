local hh    = require('spec.spec_helper')
local azk   = require('azk')
local app   = require('azk.app')
local shell = require('azk.cli.shell')
local utils = require('azk.utils')
local fs    = require('azk.utils.fs')

local path    = azk.path
local command = require('azk.cli.commands.exec')

describe("Azk #cli #commandexec", function()
  local i18n_f     = azk.i18n.module("exec")
  local i18n_app_f = azk.i18n.module("app")
  local i18n_pro_f = azk.i18n.module("provision")

  after_each(function()
    hh.remove_test_images(images)
  end)

  it("should return 1 with blank invocation", function()
    local result = command.run()
    assert.is.equal(result, 1)
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
end)
