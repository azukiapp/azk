local agent_ssh = require('azk.agent.ssh')
local azk = require('azk')
local tablex = require('pl.tablex')

local command = {}
command["short_help"] = "Agent agent administration"

function command.run(...)
  local args = { ... }
  if table.remove(args, 1) == "exec" then
    return agent_ssh.run(azk.agent_ip(), unpack(args))
  end
end

return command
