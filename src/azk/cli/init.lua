local cli    = {}
local azk    = require('azk')
local utils  = require('azk.utils')
local shell  = require('azk.cli.shell')

local each = require('fun').each

local switch = utils.switch

local function proceed()
  --args = {...}
  --command = table.remove(args, 1)
  --require('azk.cli.command' .. command).run(unpack(args))
end

local function display_version()
  shell.print("azk %s", azk.version)
end

local function display_help()
  display_version()
end

local function check_for_shortcuts(...)
  local h, v = "help", "version"
  local opts = {
    ["--help"] = h, ["-h"] = h, ["-help"] = h,
    ["--version"] = v, ["-v"] = v
  }
  return (opts[select(1, ...)] or h)
end

function cli.set_output(file)
  output = file
end

function cli.run(...)
  switch(check_for_shortcuts(...)) : caseof {
    ["version"] = display_version,
    ["help"]    = display_help,
    default     = proceed
  }
end

return cli
