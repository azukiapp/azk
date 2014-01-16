local cli    = {}
local azk    = require('azk')
local shell  = require('azk.cli.shell')

local utils  = require('azk.utils')
local path   = require('pl.path')
local dir    = require('pl.dir')
local tablex = require('pl.tablex')

local switch = utils.switch

local function process(...)
  args = {...}
  command = table.remove(args, 1)
  require('azk.cli.commands.' .. command).run(unpack(args))
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
  shell.print("\nSee `azk help <command> for information on a specific command.")
  shell.print("For full documentation, see: https://azk.io")
end

local function display_help()
  display_version()
  display_usage()
end

local function check_for_shortcuts(...)
  local h, v = "help", "version"
  local opts = {
    ["--help"] = h, ["-h"] = h, ["-help"] = h,
    ["--version"] = v, ["-v"] = v
  }
  return (opts[select(1, ...) or "-v"])
end

function cli.set_output(file)
  output = file
end

function cli.run(...)
  local args = {...}
  switch(check_for_shortcuts(...)) : caseof {
    ["version"] = display_version,
    ["help"]    = display_help,
    default     = function()
      process(unpack(args))
    end
  }
end

return cli
