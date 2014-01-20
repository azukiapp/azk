local helper = require('spec.spec_helper')
local path   = require('pl.path')
local azk    = require('azk')

describe("Azk #agent", function()
  local agent  = require('azk.agent')
  local o_path = azk.agent_mount_path

  after_each(function()
    azk.agent_mount_path = o_path
  end)

  pending("should check mount and return path", function()
    local dir = helper.tmp_dir()
    local result, point = agent.mount(dir)
    local expect = path.normpath(path.join(
      azk.agent_mount_path,
      "." .. dir
    ))

    assert.is_true(result)
    assert.is.equal(expect, point)
  end)

  pending("should do nothing if run in agent", function()
    azk.agent_mount_path = helper.tmp_dir()

    local dir = path.join(azk.agent_mount_path, "foo")
    path.mkdir(dir)
    local result, point = agent.mount(dir)

    assert.is_true(result)
    assert.is.equal(dir, point)
  end)
end)
