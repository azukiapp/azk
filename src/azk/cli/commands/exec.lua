local app   = require('azk.app')
local path  = require('pl.path')
local shell = require('azk.cli.shell')

local command = {}

command["short_help"] = "Run an executable with the image-app"
function command.run(...)
  -- azk exec comand [args]
  -- azk exec -i command [args]

  local args = {...}
  if #args >= 1 then
    local result, file, err = app.find_manifest(path.currentdir())
    if not result then
      shell.error(err)
    end
  end

  return 1
end

return command
