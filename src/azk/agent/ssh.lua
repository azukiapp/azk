local azk    = require('azk')
local path   = require('azk.utils.path')
local os     = require('os')
local tablex = require('pl.tablex')

local cmd     = "/usr/bin/ssh"
local user    = "core"
local options = table.concat({
  "-o DSAAuthentication=yes",
  "-o StrictHostKeyChecking=no",
  "-o UserKnownHostsFile=/dev/null",
  "-o LogLevel=FATAL",
  "-o IdentitiesOnly=yes"
}, " ")
local identify = "-i " .. path.join(
  azk.root_path, "src", "share", "insecure_private_key"
)

local final  = "%s %s %s@%s %s"
local with_p = "%s \"%s\""

local ssh = {}

function ssh.run(host, ...)
  local _cmd = final:format(
    cmd, identify, user, host, options
  )

  local args = {...}
  if #args > 0 then
    if args[1] == "-t" then
      table.remove(args, 1)
      _cmd = _cmd .. " -t"
    end

    args = tablex.imap(function(arg)
      if arg:match("%s+") then
        arg = '\\"' ..
          arg:gsub('\\', '\\\\\\\\'):
          gsub("%$", '\\\\\\$'):
          gsub('"', '\\\\\\"')
        .. '\\"'
      end
      return arg
    end, args)

    args = table.concat(args, " ")
    _cmd = with_p:format(_cmd, args)
  end

  return os.execute(_cmd)
end

return ssh

