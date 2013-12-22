-- Spec helpers
require('fun')()

local azk   = require('azk')
local path  = require('azk.utils.path')
local fs    = require('azk.utils.fs')

local random = require('math').random
local unique = require('azk.utils').unique_id

local tmp_path = path.normalize(
  path.join(azk.root_path, "tmp", "test")
)

helper = {}

function helper.tmp_dir(make)
  local new_path = path.join(tmp_path, unique())
  if make or make == nil then
    fs.mkdir_p(new_path)
  end
  return new_path
end

-- Asserts extend
local assert = require("luassert")
local say    = require("say")

local function match(state, arguments)
  local value = arguments[1]
  local pattern = arguments[2]

  if value:match(pattern) == nil then
    return false
  else
    return true
  end
end

say:set_namespace("en")
say:set("assertion.match.positive", "Expected value %s to match with pattern: %s")
say:set("assertion.match.negative", "Expected value %s not match with pattern: %s")
assert:register("assertion", "match", match, "assertion.match.positive", "assertion.match.negative")

return helper
