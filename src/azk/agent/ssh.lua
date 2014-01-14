local azk  = require('azk')
local path = require('azk.utils.path')
local os   = require('os')

local cmd     = "/usr/bin/env ssh"
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
local with_p = "%s '%s'"

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

    _cmd = with_p:format(_cmd, table.concat(args, " "))
  end

  return os.execute(_cmd)
end

return ssh

