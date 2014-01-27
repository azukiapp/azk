local io      = require('io')
local colors  = require('ansicolors')
local S       = require('syscall')
local tablex  = require('pl.tablex')
local json    = require('json')
local stringx = require('pl.stringx')
local serpent = require('serpent')

local shell = {}

local logs_format="%%{reset}%%{%s}azk %s%%{reset}: %s%%{reset}"
local logs_type = {
  ['error'] = "red",
  info      = "blue",
  warning   = "yellow"
}

function shell.capture_io(input, func)
  local _, _err, dr, dw = S.pipe()

  if func == nil then
    func, input = input, nil
  end

  -- Clear before data
  io.stdout:flush()
  io.stderr:flush()

  local pid = S.fork()

  if pid == 0 then
    local _, err, our, ouw = S.pipe()
    local _, err, oer, oew = S.pipe()
    local _, _err, inr, inw = S.pipe()

    ---- Fake input
    if input ~= nil then
      inw:write(input .. "\n")
    end

    ---- Replace defaults
    assert(S.dup2(inr, 0))
    assert(S.dup2(ouw, 1))
    assert(S.dup2(oew, 2))

    io.stdout:setvbuf("no")
    io.stderr:setvbuf("no")

    --io.stdout:flush()
    --io.stderr:flush()

    --io.stdout:seek("end")
    --io.stderr:seek("end")

    ---- Run code with print and read
    local status, err = xpcall(function()
      return func(inw, our)
    end, function(err)
      return debug.traceback(err, 2)
    end)

    ouw:write("\n")
    oew:write("\n")

    --io.stdout:flush()
    --io.stderr:flush()

    local result = {
      ['stdout'] = our:read():gsub("\n$", ""),
      ['stderr'] = oer:read():gsub("\n$", "")
    }

    if status then
      result['result'] = err
    else
      result['err'] = err
    end

    dw:write(serpent.dump(result))

    S.close(dw)
    S.exit(0)
  end

  S.waitpid(pid)

  local ok, result = serpent.load(dr:read(nil, 100000))

  io.stdout:flush()
  io.stderr:flush()

  if result.err then
    error(result.err)
  end

  return result
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

  shell[log .. "_format"] = function(msgs, ...)
    return(shell.format(
      logs_format:format(color, log, msgs),
      ...
    ))
  end
end)

return shell
