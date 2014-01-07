local cli   = require('azk.cli')
local shell = require('azk.cli.shell')

local command = require('azk.cli.commands.exec')

describe("Azk #cli #command exec", function()
  it("blank invocation", function()
    command.run('-arg')
  end)
end)
