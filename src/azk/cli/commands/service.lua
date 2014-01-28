local azk       = require('azk')
local app       = require('azk.app')
local shell     = require('azk.cli.shell')
local path      = require('pl.path')
local provision = require('azk.box.provision')

local command = {}
local i18n_f = azk.i18n.module("command_service")
local function log_info(...)
  shell.info(i18n_f(...))
end

local function log_error(...)
  shell.error(i18n_f(...))
end

command["short_help"] = "Manage services related to current application"

function command.run(service, action, ...)
  if service then
    local args = {...}
    local result, data, err = app.new(path.currentdir())
    if not result then
      shell.error(err)
      return 1
    end

    local options = { }

    if args[1] == "-n" and args[2] then
      options.number = tonumber(args[2])
    end

    if provision(data, { loop = true }) then
      app.service(data, service, action, options)
    end

  end

  return 1
end

return command

