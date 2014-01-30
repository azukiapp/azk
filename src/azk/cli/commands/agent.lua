local agent_ssh = require('azk.agent.ssh')
local azk       = require('azk')
local tablex    = require('pl.tablex')
local luker     = require('luker')
local shell     = require('azk.cli.shell')

local command = {}
command["short_help"] = "Agent administration"

local function docker(action, ...)
  if action == "killall" then
    shell.info("Get containers list...")
    local containers, code = luker.containers({ all = true })
    if code == 200 then
      shell.info("Removing %s instances", #containers)
      tablex.foreachi(containers, function(container)
        luker.stop_container({ id = container.Id })
        luker.remove_container({ Id = container.Id })
      end)
    else
      shell.error(result)
    end
  end
end

function command.run(cmd, ...)
  local args = { ... }

  if cmd == "exec" then
    local _, _, code = agent_ssh.run(azk.agent_ip(), unpack(args))
    return code
  end

  if cmd == "docker" then
    docker(...)
  end
end

return command
