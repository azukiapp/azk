local lfs = require('lfs')
local dirname = require('azk.utils.path').dirname
local join    = require('azk.utils.path').join

local ffi = require('ffi')
local C = ffi.C

ffi.cdef [[
  int system(const char *command);
]]

local open   = require('io').open
local remove = require('os').remove

local serpent = require('spec.utils.serpent')
local g_print = print
local print   = function(...)
  g_print(serpent.line(...))
end

local M = { separator = sep }
setfenv(1, M)

local no_such_msg = "No such file or directory"

function stat(path)
  return lfs.attributes(path)
end

function is_exist(path)
  local attr = stat(path)
  return attr ~= nil
end

function is_dir(path)
  local attr = stat(path)
  return attr and attr.mode == "directory" or false
end

function is_regular(path)
  local attr = stat(path)
  return attr and attr.mode == "file" or false
end

function mkdir(path)
  return lfs.mkdir(path)
end

function mkdir_p(path)
  local result, err = mkdir(path)
  if result == nil and err == no_such_msg then
    result, err = mkdir_p(dirname(path))
    if result then
      return mkdir(path)
    else
      return result, err
    end
  end
  return result, err
end

function touch(...)
  local result, err = lfs.touch(...)
  if result == nil and err == no_such_msg then
    return open(({ ... })[1], "w")
  end
  return result, err
end

function rm(path)
  if is_dir(path) then
    return lfs.rmdir(path)
  end
  return remove(path)
end

function rm_rf(path)
  if not is_dir(path) then
    return remove(path)
  else
    local entrie, dir = lfs.dir(path)
    for entrie in entrie, dir do
      if entrie ~= ".." and entrie ~= "." then
        entrie = join(path, entrie)
        local sub_result, sub_msg = rm_rf(entrie)
        if sub_msg ~= nil then
          return sub_result, sub_msg, entrie
        end
      end
    end
    dir:close()
    return lfs.rmdir(path)
  end
end

-- Alias
is_exists = is_exist

return M
