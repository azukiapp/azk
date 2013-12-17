local shell = {}

local io = require('io')
local output = io.stdout
local format = string.format
local std_print = print

setfenv(1, shell)

function io_capture(func)
  local tmp_output = io.tmpfile()
  local old_output = output

  -- Capture
  output = tmp_output
  func()
  output = old_output

  -- Read
  tmp_output:seek("set")
  return tmp_output:read("*a")
end

function print(...)
  output:write(format(...))
  output:write("\n")
end

return shell
