local utils  = require('azk.utils')
local i18n   = require('azk.i18n')

local os      = require('os')
local socket  = require('socket')
local path    = require('pl.path')
local memoize = require('pl.utils').memoize

local M = {
  i18n  = i18n,
  path  = path,
  utils = utils
}

M.version    = "0.0.1"
M.manifest   = "azkfile.json"
M.root_path  = path.normpath(
  path.join(utils.__DIR__(), "..", "..")
)

M.data_path  = path.join(M.root_path, "data")
M.boxes_path = path.join(M.data_path, "boxes")
M.apps_path  = path.join(M.data_path, "apps")

M.agent_mount_path = "/home/core/all"

-- TODO: Add test
local get_agent_ip = memoize(function(host)
  local result, err = socket.dns.toip(host)
  if result then return result end
  error(err)
end)

function M.agent_ip(host)
  return get_agent_ip(host or os.getenv("AZK_AGENT_HOST") or "azk-agent")
end

return M
