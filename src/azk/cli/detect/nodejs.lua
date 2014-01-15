local utils = require('azk.utils')
local fs = require('azk.utils.fs')

local node = {}
local box  = {
  box = "azukiapp/node-box#stable"
}

function node.detect(path)
  if fs.is_regular(path .. "/" .. "package.json") then
    return box
  end
end

return node
