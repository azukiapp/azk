local utils = require('azk.utils')
local fs    = require('azk.utils.fs')

local ruby = {}
local box  = {
  box = "azukiapp/ruby-box#stable"
}

function ruby.detect(path)
  if fs.is_regular(path .. "/" .. "Gemfile") then
    return box
  end
end

return ruby
