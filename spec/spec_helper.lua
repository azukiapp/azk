-- Spec helpers
local azk   = require('azk')
local utils = require('azk.utils')
local path  = require('azk.utils.path')
local fs    = require('azk.utils.fs')
local shell = require('azk.cli.shell')

local serpent = require('spec.utils.serpent')
local random  = require('math').random
local unique  = require('azk.utils').unique_id

local tablex   = require('pl.tablex')
local stringx  = require('pl.stringx')

local tmp_path = path.normalize(
  path.join(azk.root_path, "tmp", "test")
)

local helper = {}

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

helper.er = helper.escape_regexp

function helper.pp(...)
  if #{...} == 1 then
    print(serpent.block(...))
  else
    print(serpent.block({...}))
  end
end

function helper.unmock(mock)
  tablex.foreach(mock, function(v)
    v:revert()
  end)
end

function helper.reset_mock(mock)
  tablex.foreach(mock, function(v)
    v.calls = {}
  end)
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

local function blank(state, arguments)
  local value = arguments[1]

  return(
    value == false or
    value == nil or
    stringx.strip(value) == ""
  )
end

local function has_log(state, arguments)
  local log_type   = arguments[1]
  local expect_msg = shell[log_type .. "_format"](arguments[2])
  local message    = arguments[3]

  arguments[1] = expect_msg
  arguments[2] = message

  expect_msg = helper.escape_regexp(expect_msg)
  return message:match(expect_msg) ~= nil
end

say:set_namespace("en")
say:set("assertion.blank.positive", "\nExpect %s is blank")
say:set("assertion.blank.negative", "\nExpect %s is not blank")
say:set("assertion.match.positive", shell.format("\n%%s\n%{red}to match with pattern%{reset}:\n%{yellow}%%s%{reset}"))
say:set("assertion.match.negative", shell.format("\n%%s\n%{red}not match with pattern%{reset}:\n%{yellow}%%s%{reset}"))
say:set("assertion.has_log.positive", "\nExpected log message\n%s\nin:\n%s")
say:set("assertion.has_log.negative", "\nExpected log message:\n%s\nto not be in:\n%s")

assert:register("assertion", "blank", blank, "assertion.blank.positive", "assertion.blank.negative")
assert:register("assertion", "match", match, "assertion.match.positive", "assertion.match.negative")
assert:register("assertion", "has_log", has_log, "assertion.has_log.positive", "assertion.has_log.negative")

return helper
