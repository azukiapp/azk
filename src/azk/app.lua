local azk  = require('azk')
local fs   = require('azk.utils.fs')
local path = require('azk.utils.path')

local M = {}
setfenv(1, M)

local function __find_manifest(dir)
  local entries, dir = fs.dir(dir)
  for entrie in entries, dir do
    if entrie == azk.manifest then return true end
  end
  dir:close()
  return false
end

function find_manifest(dir)
  if __find_manifest(dir) then
    return path.join(dir, azk.manifest)
  end

  if dir ~= path.rootvolume then
    dir = path.normalize(path.join(dir, ".."))
    return find_manifest(dir)
  end

  return false, { msg = "azk: manifest not founded" }
end

return M
