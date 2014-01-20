local path = require('pl.path')
local ssh  = require('azk.agent.ssh')
local azk  = require('azk')

-- TODO: Not run this if not use virtual agent
local check = 'mount | grep "%s type 9p" &>/dev/null'
local mount_cmd = 'sudo mount -t 9p "${SSH_CLIENT%%%% *}" %s -o aname=%s,port=5640,dfltuid=$(id -u),dfltgid=$(id -g)'

local function run_cmd(cmd)
  return ssh.run(azk.agent_ip(), "/bin/bash", "-c", cmd)
end

local function check_mount(dir)
  local cmd = check:format(dir)
  local _, _, code = run_cmd(cmd)
  return code == 0
end

local function run_mount(dir, target)
  return run_cmd(mount_cmd:format(dir, target))
end

local function mount_all()
  local dir = azk.agent_mount_path
  if not check_mount(dir) then
    return run_mount(dir, "/")
  end
  return true
end

local function mount(dir)
  if path.common_prefix(dir, azk.agent_mount_path) == azk.agent_mount_path then
    return true, dir
  end

  if path.isdir(dir) and mount_all() then
    return true, path.normpath(path.join(
      azk.agent_mount_path,
      "." .. dir
    ))
  end
end

return {
  mount = mount,
  run   = function(...)
    return ssh.run(azk.agent_ip(), ...)
  end
}
