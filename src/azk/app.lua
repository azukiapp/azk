local azk  = require('azk')
local fs   = require('azk.utils.fs')
local path = require('azk.utils.path')
local uuid = require('azk.utils.native.uuid')

local app = {}

local function __find_manifest(dir)
  local entries, dir = fs.dir(dir)
  for entrie in entries, dir do
    if entrie == azk.manifest then return true end
  end
  dir:close()
  return false
end

function app.find_manifest(dir)
  if __find_manifest(dir) then
    return path.join(dir, azk.manifest)
  end

  if dir ~= path.rootvolume then
    dir = path.normalize(path.join(dir, ".."))
    return app.find_manifest(dir)
  end

  error({ msg = "manifest not founded" })
end

function app.new(path)
end

function app.new_id()
  return uuid.new_clear(15)
end

return app
