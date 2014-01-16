local azk  = require('azk')
local uuid = require('azk.utils.native.uuid')
local path = require('pl.path')
local dir  = require('pl.dir')

local app = {}

local function __find_manifest(target)
  return #(dir.getfiles(target, azk.manifest)) == 1
end

-- TODO: Fixing windows root
function app.find_manifest(target)
  if __find_manifest(target) then
    return path.join(target, azk.manifest)
  end

  target = path.normpath(path.join(target, ".."))
  if target ~= "/" then
    return app.find_manifest(target)
  end

  error({ msg = "manifest not founded" })
end

function app.new(path)
end

function app.new_id()
  return uuid.new_clear(15)
end

return app
