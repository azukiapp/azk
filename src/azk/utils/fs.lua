local io  = require('io')
local lfs = require('lfs')

local dirname  = require('azk.utils.path').dirname
local basename = require('azk.utils.path').basename
local join     = require('azk.utils.path').join

local ffi = require('ffi')
local C = ffi.C

ffi.cdef [[
  int system(const char *command);
]]

local open   = require('io').open
local remove = require('os').remove

local serpent = require('spec.utils.serpent')
local error   = error
local pcall   = pcall
local g_print = print
local print   = function(...)
  g_print(serpent.line(...))
end

local M = { separator = sep }
setfenv(1, M)

local no_such_msg = "No such file or directory"
local bf_size = 2^13

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

function pwd()
  return lfs.currentdir()
end

function cd(path, func)
  if func then
    local current = pwd()
    local result, err = lfs.chdir(path)
    if result then
      func()
    else
      return result, err
    end
    path = current
  end
  return lfs.chdir(path)
end

function read(file)
  local f = io.open(file, "rb")
  local content = f:read("*all")
  f:close()
  return content
end

function cp_ha(origin, destination)
  if not is_exist(origin) then
    error(origin .. ": No such file or directory")
  elseif is_dir(origin) then
    error(origin .. " is a directory (not copied)")
  end

  local base = basename(destination)
  if base == '' or is_dir(destination) then
    base = basename(origin)
    destination = join(destination, base)
  end

  if not is_dir(dirname(destination)) then
    error("directory " .. dirname(destination) .. " does not exist")
  end

  local f_origin = io.open(origin, "rb")
  local f_dest   = io.open(destination, "wb")

  while true do
    local block = f_origin:read(bf_size)
    if not block then break end
    f_dest:write(block)
  end

  f_origin:close()
  f_dest:close()
end

function cp(origin, dest)
  return pcall(cp_ha, origin, dest)
end

function cp_r_ha(origin, dest)
  if not is_dir(origin) then
    return cp_ha(origin, dest)
  elseif not is_dir(dirname(dest)) then
    error("directory " .. dirname(dest) .. " does not exist")
  end

  if not is_dir(dest) then mkdir(dest) end

  local entries, dir = lfs.dir(origin)
  for entrie in entries, dir do
    if entrie ~= ".." and entrie ~= "." then
      cp_r_ha(join(origin, entrie), join(dest, entrie))
    end
  end
  dir:close()
end

function cp_r(origin, dest)
  return pcall(cp_r_ha, origin, dest)
end

-- Alias
is_exists = is_exist
dir = lfs.dir

return M
