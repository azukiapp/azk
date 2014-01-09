local shell = require('azk.cli.shell')
local app   = require('azk.app')
local fs    = require('azk.utils.fs')
local azk   = require('azk')

local command = {}
-- local print = require('azk.cli.shell').print
local print  = print
local unpack = unpack

setfenv(1, command)

command["short_help"] = "Initializes a project by adding the file azkfile.json"

function run(...)
  local args = {...}
  local path = args[1] or "."
  local file = path .. "/" .. azk.manifest
  if fs.is_regular(file) then
    shell.error("[init] '%s' already exists", file)
  end
end

return command
