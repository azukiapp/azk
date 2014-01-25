local azk   = require('azk')
local shell = require('azk.cli.shell')
local uuid  = require('azk.utils.native.uuid')
local path  = require('pl.path')
local dir   = require('pl.dir')
local pl_utils = require('pl.utils')
local json  = require('json')
local box   = require('azk.box')

local app = {}
local i18n_f = azk.i18n.module("app")

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

  return false, nil, i18n_f("no_such", { file = azk.manifest })
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
  local repository = "azk/apps/" .. content['id']
  local data = {
    -- App data
    id       = content['id'],
    manifest = file,
    content  = content,
    from     = parse_box(content['box'], file),

    -- Box info
    ['type']   = "app",
    repository = repository,
    image      = repository .. ":latest",
    path       = path.dirname(file),
  }

  return true, data
end

function app.new_id()
  return uuid.new_clear(15)
end

return app
