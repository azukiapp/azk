local azk = require('azk')
local os  = require('os')

describe("azk", function()
  it("should return a azk root path", function()
    local root_path = os.getenv('AZK_PATH')
    assert.are.equal(azk.root_path, root_path)
  end)
end)
