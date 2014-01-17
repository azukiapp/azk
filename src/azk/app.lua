local azk   = require('azk')
local shell = require('azk.cli.shell')
local uuid  = require('azk.utils.native.uuid')
local path  = require('pl.path')
local dir   = require('pl.dir')

local app = {}

local function __find_manifest(target)
  return #(dir.getfiles(target, azk.manifest)) == 1
end

-- TODO: Fixing windows root
function app.find_manifest(target)
  if __find_manifest(target) then
    return true, path.join(target, azk.manifest)
  end

  target = path.normpath(path.join(target, ".."))
  if target ~= "/" then
    return app.find_manifest(target)
  end

  return false, nil, shell.format(
    "no such '%{yellow}%s%{reset}' in current project",
    azk.manifest
  )
end

function app.new(P)
  local file = app.find_manifest(P)
end

function app.new_id()
  return uuid.new_clear(15)
end

return app
