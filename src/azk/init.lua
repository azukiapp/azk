local utils = require('azk.utils')
local path  = require('azk.utils.path')

local M = {}
setfenv(1, M)

M.version   = "0.0.1"
M.manifest  = "azkfile.json"
M.root_path = path.normalize(
  path.join(utils.__DIR__(), "..", "..")
)

return M
