local fs   = require('azk.utils.fs')
local path = require('azk.utils.path')
local print = print
local error = error

local M = {}
setfenv(1, M)

local regex = {
  github = "^([%w%-]+/[%w%-]+)#?(.*)$",
  path   = "^%.-/.*$",
  docker = "^([^:]+):(.*)$"
}

local github   = 'https://github.com/'
local path_not = "box directory '%s' not found"
local invalid  = "'%s' is not a valid definition of box"

local function github_format(repo, version)
  version = version ~= "" and version or "master"
  return {
    ['type']   = 'github',
    repository = github .. repo,
    path       = repo,
    version    = version,
    image      = repo .. ':' .. version
  }
end

local function path_format(box_name)
  -- Expand path
  if not box_name:match("^/.*$") then
    box_name = path.join(fs.pwd(), box_name)
    box_name = path.normalize(box_name)
  end

  if fs.is_dir(box_name) then
    version  = fs.shasum(box_name)
    box_name = box_name:gsub("/$", "")
    return {
      ['type']   = 'path',
      repository = nil,
      path       = box_name,
      version    = version,
      image      = box_name .. ':' .. version
    }
  else
    error(path_not:format(box_name))
  end
end

local function docker_format(box_name, version)
  return {
    ['type']   = 'docker',
    repository = nil,
    path       = nil,
    version    = version,
    image      = box_name
  }
end

function parse(box_name)
  local data = {}

  -- Github
  local repo, version = box_name:match(regex.github)
  if repo then
    return github_format(repo, version)
  end

  -- Path
  if box_name:match(regex.path) then
    return path_format(box_name)
  end

  -- Docker
  local image, version = box_name:match(regex.docker)
  if image then
    return docker_format(box_name, version)
  end

  error(invalid:format(box_name))
end

return M
