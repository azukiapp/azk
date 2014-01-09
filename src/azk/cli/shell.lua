local io     = require('io')
local colors = require('ansicolors')
local each   = require('fun').each

local output    = io.stdout
local format    = string.format
local std_print = print
local unpack    = unpack

local shell = {}
setfenv(1, shell)

local logs_format="%%{reset}%%{%s}azk %s%%{reset}: %s%%{reset}"
local logs_type = {
  ['error'] = "red",
  info      = "blue",
  warning   = "yellow"
}

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

function print(data, ...)
  data = format(colors.noReset(data), ...)
  output:write(data.. "\n")
end

each(function(log, color)
  shell[log] = function(msgs, ...)
    msgs = format(logs_format, color, log, msgs)
    print(msgs, ...)
  end
end, logs_type)

return shell
