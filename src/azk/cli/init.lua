local cli    = {}
local azk    = require('azk')
local switch = require('azk.utils').switch

local function proceed()
end

local function display_help()
end

local function display_version()
  print("azk " .. azk.version)
end

local function check_for_shortcuts(...)
  local h, v = "help", "version"
  local opts = {
    ["--help"] = h, ["-h"] = h, ["-help"] = h,
    ["--version"] = v, ["-v"] = v
  }
  return opts[arg[1]]
end

function cli.run(...)
  switch(check_for_shortcuts(...)) : caseof {
    ["version"] = display_version,
    ["help"]    = display_help,
    default     = proceed
  }
end

return cli
