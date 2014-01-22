local azk   = require('azk')
local shell = require('azk.cli.shell')
local uuid  = require('azk.utils.native.uuid')
local path  = require('pl.path')
local dir   = require('pl.dir')
local pl_utils = require('pl.utils')
local json  = require('json')
local box   = require('azk.box')

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

local function parse_box(value, file)
  -- Relative box
  if value:match("^%..*$") then
    return box.parse(path.normpath(path.join(
      path.dirname(file), value
    )))
  end
  return box.parse(value)
end

function app.new(P)
  local result, file, err = app.find_manifest(P)
  if not result then
    return result, file, err
  end

  local content = json.decode(pl_utils.readfile(file))
  local data = {
    id       = content['id'],
    path     = path.dirname(file),
    manifest = file,
    content  = content,
  }

  if data['id'] then
    data['imagem'] = "azk/apps/" .. data['id']
  end

  data['from'] = parse_box(content['box'], file)
  return true, data
end

function app.new_id()
  return uuid.new_clear(15)
end

return app
