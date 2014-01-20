local utils  = require('azk.utils')
local path   = require('pl.path')
local os     = require('os')
local socket = require('socket')
local memoize = require('pl.utils').memoize

local M = {}

M.version    = "0.0.1"
M.manifest   = "azkfile.json"
M.root_path  = path.normpath(
  path.join(utils.__DIR__(), "..", "..")
)

M.data_path  = path.join(M.root_path, "data")
M.boxes_path = path.join(M.data_path, "boxes")

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
