-- Spec helpers
require('fun')()

local azk   = require('azk')
local utils = require('azk.utils')
local path    = require('azk.utils.path')
local fs      = require('azk.utils.fs')
local serpent = require('spec.utils.serpent')

local random  = require('math').random
local unique  = require('azk.utils').unique_id

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

function helper.fixture_path(name)
  return path.join(utils.__DIR__(), "fixtures", name)
end

local quotepattern = '(['..("%^$().[]*+-?"):gsub("(.)", "%%%1")..'])'
function helper.escape_regexp(str)
  return str:gsub(quotepattern, "%%%1")
end

function helper.pp(...)
  print(serpent.block(...))
end

-- Asserts extend
local assert = require("luassert")
local say    = require("say")

local function match(state, arguments)
  local value = arguments[1]
  local pattern = arguments[2]

  if (value or ""):match(pattern) == nil then
    return false
  else
    return true
  end
end

local function trim(s)
  return (s:gsub("^%s*(.-)%s*$", "%1"))
end

local function blank(state, arguments)
  local value = arguments[1]

  return(
    value == false or
    value == nil or
    trim(value) == ""
  )
end

say:set_namespace("en")
say:set("assertion.blank.positive", "\nExpect %s is blank")
say:set("assertion.blank.negative", "\nExpect %s is not blank")
assert:register("assertion", "blank", blank, "assertion.blank.positive", "assertion.blank.negative")

say:set_namespace("en")
say:set("assertion.match.positive", "\n%s\nto match with pattern:\n%s")
say:set("assertion.match.negative", "\n%s\nnot match with pattern:\n%s")
assert:register("assertion", "match", match, "assertion.match.positive", "assertion.match.negative")

return helper
