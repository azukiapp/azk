local utils = require('azk.utils')
local path  = require('azk.utils.path')
require('fun')()

describe("Azk utils", function()
  it("should return a current file and directory", function()
    local azk_path  = require('os').getenv("AZK_PATH")

    assert.are.equal(utils.__FILE__(),
      path.join(azk_path, "spec", "azk", "utils_spec.lua")
    )

    assert.are.equal(utils.__DIR__(),
      path.join(azk_path, "spec", "azk")
    )
  end)

  it("should return a unique id", function()
    local id = utils.unique_id()
    assert.are.equal(32, #id)
    assert.match(id, "^[%a|%d]*$")
    assert.are_not.equal(id, utils.unique_id())
  end)
end)
