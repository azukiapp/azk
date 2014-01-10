local io     = require('io')
local colors = require('ansicolors')
local each   = require('fun').each

local output = io.stdout
local input  = io.stdin

local str_format = string.format
local std_print  = print
local unpack     = unpack

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
  data = tmp_output:read("*a")
  tmp_output:close()

  return data
end

function fake_input(data, func)
  local tmp_input = io.tmpfile()
  local old_input = input

  -- Fake input
  tmp_input:write(data)
  tmp_input:seek("set")
  input = tmp_input
  func()
  input = old_input
  tmp_input:close()
end

function format(data, ...)
  return str_format(colors.noReset(data), ...)
end

function write(...)
  output:write(format(...))
end

function print(...)
  write(...)
  output:write("\n")
end

function capture(...)
  write(...)
  return input:read()
end

each(function(log, color)
  shell[log] = function(msgs, ...)
    msgs = str_format(logs_format, color, log, msgs)
    print(msgs, ...)
  end
end, logs_type)

return shell
