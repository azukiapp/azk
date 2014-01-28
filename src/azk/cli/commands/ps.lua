local azk    = require('azk')
local app    = require('azk.app')
local shell  = require('azk.cli.shell')
local path   = require('pl.path')
local tablex = require('pl.tablex')
local luker  = require('luker')
local colors = require('ansicolors')

local command = {}
local i18n_f = azk.i18n.module("command_ps")
local function log_info(...)
  shell.info(i18n_f(...))
end

local function log_error(...)
  shell.error(i18n_f(...))
end

command["short_help"] = i18n_f("short_help")
function command.run()

  local result, data, err = app.new(path.currentdir())
  if not result then
    shell.error(err)
    return 2
  end

  local result, code = luker.image({ image = data.image })
  if code ~= 200 then
    shell.error(i18n_f("not_provision"))
  end

  local containers, code = luker.containers()
  if code == 200 then
    local containers = tablex.filter(containers, function(c)
      return c.Image == data.image
    end)

    local format = table.concat({
      colors("%{cyan}%-8.8s%{reset}"),
      colors("%{blue}%-14.14s%{reset}"),
      colors("%{yellow}%-14.14s%{reset}"),
      colors("%{green}%s%{reset}"),
    }, " ")

    if #containers > 0 then
      print(format:format("Type", "Azk id", "Up time", "Command"))
      print("---")

      tablex.foreachi(containers, function(c)
        local _type = c.Names[1]:gsub("^/%w*%.(.*)%.%w*$", "%1")
        _type = _type:gsub("^service%.", "")
        print(format:format(_type, c.Id, c.Status, c.Command))
      end)
    end
  end
end

return command
