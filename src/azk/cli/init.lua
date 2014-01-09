local cli    = {}
local azk    = require('azk')
local shell  = require('azk.cli.shell')

local utils  = require('azk.utils')
local path   = require('azk.utils.path')
local fs     = require('azk.utils.fs')

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
  local entries, dir = fs.dir(cmds_path)
  for entrie in entries, dir do
    local file = path.join(cmds_path, entrie)
    if fs.is_regular(file) then
      entrie = path.basename(entrie, ".lua")
      local short = require('azk.cli.commands.' .. entrie).short_help
      shell.print("   %-10s %s", entrie, short)
    end
  end
  dir:close()
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
