local cli    = {}
local azk    = require('azk')
local shell  = require('azk.cli.shell')

local utils  = require('azk.utils')
local path   = require('pl.path')
local dir    = require('pl.dir')
local tablex = require('pl.tablex')

local switch = utils.switch

local function commands()
  return {
    module = 'azk.cli.commands',
    path   = path.join(utils.__DIR__(), "commands")
  }
end

local function display_version()
  shell.print("azk %s", azk.version)
end

local function display_commands_list()
  shell.print("\nSome useful azk commands are:")

  local cmds_path = path.join(utils.__DIR__(), "commands")
  local files = dir.getfiles(cmds_path, "*.lua")

  tablex.foreachi(files, function(file)
    if path.isfile(file) then
      local command = utils.basename(file, ".lua")
      local short = require('azk.cli.commands.' .. command).short_help
      shell.print("   %-10s %s", command, short)
    end
  end)
end

local function display_usage()
  shell.print("Usage: azk <command> [<args>]")
  display_commands_list()
  shell.print("\nSee `%{yellow}azk help <command>%{reset}` for information on a specific command.")
  shell.print("For full documentation, see: %{blue}http://azk.io%{blue}")
end

local function display_help()
  display_version()
  display_usage()
end

local function check_for_shortcuts(...)
  local h, v = "help", "version"
  local opts = {
    ["--help"] = h, ["-h"] = h, ["-help"] = h, ["help"] = h,
    ["--version"] = v, ["-v"] = v
  }
  return (opts[select(1, ...) or "-v"])
end

local function process(command, ...)
  local module = commands().module .. "." .. command

  -- Try require
  local result, module = pcall(require, module)
  if not result then
    result, module = pcall(require, command)
  end

  -- Run
  if result then
    local result, err = pcall(module.run, ...)
    if not result then
      if type(err) == "table" and err.msg then
        shell.error(err.msg)
      else
        shell.error("internal error '%s'", err)
      end
      return err.code or 127
    end
    return err
  end

  -- Return error
  shell.error("no such command '%s'\n", command)
  display_usage()
  return 1
end

function cli.run(...)
  local args = {...}
  return switch(check_for_shortcuts(...)) : caseof {
    ["version"] = display_version,
    ["help"]    = display_help,
    default     = function()
      return process(unpack(args))
    end
  }
end

return cli
