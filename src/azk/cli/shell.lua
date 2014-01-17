local io     = require('io')
local colors = require('ansicolors')
local S      = require('syscall')
local tablex = require('pl.tablex')

local shell = {}

local logs_format="%%{reset}%%{%s}azk %s%%{reset}: %s%%{reset}"
local logs_type = {
  ['error'] = "red",
  info      = "blue",
  warning   = "yellow"
}

local _, err, our, ouw = S.pipe()
local _, err, oer, oew = S.pipe()

local inb = S.dup(0)
local oub = S.dup(1)
local oeb = S.dup(2)

function shell.capture_io(input, func)
  local _, _err, inr, inw = S.pipe()

  if func == nil then
    func, input = input, nil
  end

  -- Clear before data
  io.stdout:flush()
  io.stderr:flush()

  -- Fake input
  if input ~= nil then
    inw:write(input .. "\n")
  end

  -- Replace defaults
  assert(S.dup2(inr, 0))
  assert(S.dup2(ouw, 1))
  assert(S.dup2(oew, 2))

  -- Run code with print and read
  local result, err = xpcall(function()
     func(inw, our)
  end, function(err)
    return debug.traceback(err, 2)
  end)

  ouw:write("\n")
  oew:write("\n")

  -- Restore and reset default
  S.dup2(inb, 0)
  S.dup2(oub, 1)
  S.dup2(oeb, 2)
  io.stdout:flush()
  io.stderr:flush()
  io.stdout:setvbuf("no")
  io.stderr:setvbuf("no")

  if not result then
    our:read()
    oer:read()
    error(err)
  end

  -- Return capture
  return {
    ['stdout'] = our:read():gsub("\n$", ""),
    ['stderr'] = oer:read():gsub("\n$", "")
  }
end

function shell.format(data, ...)
  return colors.noReset(data):format(...)
end

function shell.write_device(device, ...)
  device:write(shell.format(...))
end

function shell.print_device(device, ...)
  shell.write_device(device, ...)
  device:write("\n")
end

function shell.write(...)
  shell.write_device(io.stdout, ...)
end

function shell.print(...)
  shell.print_device(io.stdout, ...)
end

function shell.capture(...)
  shell.write(...)
  return io.stdin:read()
end

tablex.foreach(logs_type, function(color, log)
  shell[log] = function(msgs, ...)
    msgs = logs_format:format(color, log, msgs)
    shell.print_device(io.stderr, msgs, ...)
  end
end)

return shell
