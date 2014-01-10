local utils = require('azk.utils')
local fs = require('azk.utils.fs')

local M = {}
setfenv(1, M)

local box = {
  box = "azukiapp/node-box#stable"
}

function detect(path)
  if fs.is_regular(path .. "/" .. "package.json") then
    return box
  end
end

return M
