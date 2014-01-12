local io     = require('io')
local http   = require('socket.http')
local ltn12  = require('ltn12')
local dkjson = require('dkjson')

local table = table
local error = error
local type  = type
local setmetatable = setmetatable

local M = {}

setfenv(1, M)

local host = "http://azk-agent:4243"

local function request(method, url)
  local response = {}
  local _, c, _ =  http.request({
    url  = host .. url,
    sink = ltn12.sink.table(response)
  })

  local data = table.concat(response)
  if c == 200 then
    return dkjson.decode(data)
  else
    error {
      code = c,
      url  = url,
      msg  = data:gsub("^%s*(.-)%s*$", "%1")
    }
  end
end

M.root = ""
local function register(endpoint, url, table)
  table = table or M
  local root = table.root and (table.root .. "/") or ""
  if url == nil or type(url) == "string" then
    table[endpoint] = function()
      return request("GET", root .. (url or ("/" .. endpoint)))
    end
  else
    local entry = { root = root }
    entry["root_endpoint"] = function(point)
      entry["root"] = entry["root"] .. point
    end
    entry["register"] = function(endpoint, url)
      register(endpoint, url, entry)
    end
    url(entry)
    setmetatable(entry, {
      __call = function(...)
        return entry["all"](...)
      end
    })
    table[endpoint] = entry
  end
end

register "version"
register "info"

register("images", function(entry)
  entry.root_endpoint("/images")
  entry.register("all", "/json")
end)

register("containers", function(entry)
  entry.root_endpoint("/containers")
  entry.register("all", "/json")
end)

setmetatable(M, {
  __index = function(table, key)
    return function()
      error("key entrypoint not implement")
    end
  end
})

return M
