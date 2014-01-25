local azk       = require('azk')
local app       = require('azk.app')
local shell     = require('azk.cli.shell')
local path      = require('pl.path')
local provision = require('azk.box.provision')

local command = {}
local i18n_f = azk.i18n.module("command_exec")
local function log_info(...)
  shell.info(i18n_f(...))
end

local function log_error(...)
  shell.error(i18n_f(...))
end

command["short_help"] = i18n_f("short_help")
function command.run(...)
  local args = {...}

  if #args >= 1 then
    local result, data, err = app.new(path.currentdir())
    if not result then
      shell.error(err)
      return 1
    end

    if provision(data, { loop = true }) then
      app.run(data, ...)
    end
  end

  return 1
end

return command
