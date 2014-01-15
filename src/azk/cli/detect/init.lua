local lustache = require "lustache"
local utils    = require('azk.utils')
local fs       = require('azk.utils.fs')
local path     = utils.path
local io       = require('io')

local rules = {}
local rules_path = utils.__DIR__()
local template = path.join(rules_path, "azkfile.mustach.json")

local entries, dir = fs.dir(rules_path)
for entrie in entries, dir do
  local file = path.join(rules_path, entrie)
  if entrie:match("[^init|.*].lua$") and fs.is_regular(file) then
    rules[#rules+1] = require(
      'azk.cli.detect.' .. path.basename(entrie, ".lua")
    )
  end
end
dir:close()

local M = {}

function M.inspect(path)
  for _, rule in pairs(rules) do
    local result = rule.detect(path)
    if result then
      return result
    end
  end
end

function M.render(data, file)
  local tpl  = fs.read(template)
  local file = io.open(file, "w")

  file:write(lustache:render(tpl, data))

  file:close()
end

return M
