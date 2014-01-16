local lustache  = require "lustache"
local utils     = require('azk.utils')
local dir       = require('pl.dir')
local path      = require('pl.path')
local pl_utils  = require('pl.utils')
local tablex    = require('pl.tablex')
local io        = require('io')

local rules_path = utils.__DIR__()
local template = path.join(rules_path, "azkfile.mustach.json")

local files = tablex.filter(
  dir.getfiles(rules_path, "*.lua"), function(file)
    return utils.basename(file) ~= "init.lua"
  end
)
local rules = tablex.map(function(file)
  local rule = utils.basename(file, ".lua")
  return require('azk.cli.detect.' .. rule)
end, files)

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
  pl_utils.writefile(
    file,
    lustache:render(
      pl_utils.readfile(template),
      data
    )
  )
end

return M
