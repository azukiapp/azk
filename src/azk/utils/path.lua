local ipairs = ipairs
local table  = table

local arch = {
  sep  = package.config:sub(1,1),
  root = ((package.config:sub(1,1) == "/") and "/" or "c:")
}

local M = { separator = arch.sep }
setfenv(1, M)

-- Split a filename into [root, dir, basename], unix version
-- 'root' is just a slash, or nothing.
local function _splitPath(filename)
  local root, dir, basename
  local i, j = filename:find("[^" .. arch.sep .. "]*$")
  if filename:sub(1, 1) == arch.sep then
    root = arch.root
    dir = filename:sub(2, i - 1)
  else
    root = ""
    dir = filename:sub(1, i - 1)
  end
  local basename = filename:sub(i, j)
  return root, dir, basename, ext
end

-- Modifies an array of path parts in place by interpreting "." and ".." segments
local function _normalizeArray(parts)
  local skip = 0
  for i = #parts, 1, -1 do
    local part = parts[i]
    if part == "." then
      table.remove(parts, i)
    elseif part == ".." then
      table.remove(parts, i)
      skip = skip + 1
    elseif skip > 0 then
      table.remove(parts, i)
      skip = skip - 1
    end
  end
end

function normalize(filepath)
  local is_absolute = filepath:sub(1, 1) == arch.sep
  local trailing_slash = filepath:sub(#filepath) == arch.sep

  local parts = {}
  for part in filepath:gmatch("[^" .. arch.sep .. "]+") do
    parts[#parts + 1] = part
  end
  _normalizeArray(parts)
  filepath = table.concat(parts, arch.sep)

  if #filepath == 0 then
    if is_absolute then
      return arch.sep
    end
    return "."
  end
  if trailing_slash then
    filepath = filepath .. arch.sep
  end
  if is_absolute then
    filepath = arch.sep .. filepath
  end
  return filepath
end

function join(...)
  local parts = {...}
  for i, part in ipairs(parts) do
    -- Strip leading slashes on all but first item
    if i > 1 then
      while part:sub(1, 1) == arch.sep do
        part = part:sub(2)
      end
    end
    -- Strip trailing slashes on all but last item
    if i < #parts then
      while part:sub(#part) == arch.sep do
        part = part:sub(1, #part - 1)
      end
    end
    parts[i] = part
  end
  return table.concat(parts, arch.sep)
end

function dirname(filepath)
  if filepath:sub(filepath:len()) == arch.sep then
    filepath = filepath:sub(1, -2)
  end

  local root, dir = _splitPath(filepath)

  if #dir > 0 then
    dir = dir:sub(1, #dir - 1)
    return root .. dir
  end
  if #root > 0 then
    return root
  end
  return "."
end

return M
