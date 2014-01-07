local command = {}
-- local print = require('azk.cli.shell').print
local print = print
local unpack = unpack

setfenv(1, command)

command["short_help"] = "Run an executable with the image-app"

function run(...)
  args = { ... }
  print(unpack(args))
end

return command
