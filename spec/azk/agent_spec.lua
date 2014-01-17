local helper = require('spec.spec_helper')
local path   = require('pl.path')
local azk    = require('azk')

describe("Azk agent", function()
  local agent  = require('azk.agent')

  it("should check mount and return path", function()
    local dir = helper.tmp_dir()
    local result, point = agent.mount(dir)
    local expect = path.normpath(path.join(
      azk.agent_mount_path,
      "." .. dir
    ))

    assert.is_true(result)
    assert.is.equal(expect, point)
  end)
end)
