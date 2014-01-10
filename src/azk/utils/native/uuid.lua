local ffi = require("ffi")
local libuuid = ffi.os == "OSX" and ffi.C or ffi.load("uuid")
local print = print

local uuid = {}
setfenv(1, uuid)

-- TODO: Implemente windows option
-- Reference: https://code.google.com/p/lua-files/source/browse/winapi/uuid.lua?r=eaea6fab8c1a9fbbf4d7644ee2b025bf0c98f49c

ffi.cdef[[
  typedef unsigned char uuid_t[16];
  void uuid_generate(uuid_t out);
  void uuid_unparse(const uuid_t uu, char *out);
]]

function new()
  local buf = ffi.new('uint8_t[16]')
  local uu  = ffi.new('uint8_t[?]', 36)

  libuuid.uuid_generate(buf)
  libuuid.uuid_unparse(buf, uu)

  return ffi.string(uu, 36)
end

function new_clear(sub)
  return new():gsub("%-", ""):lower():sub(0, sub or 32)
end

return uuid
