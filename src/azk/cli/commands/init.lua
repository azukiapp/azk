local shell  = require('azk.cli.shell')
local detect = require('azk.cli.detect')
local stringx = require('pl.stringx')

local app = require('azk.app')
local fs  = require('azk.utils.fs')
local azk = require('azk')

local command = {}

command["short_help"] = "Initializes a project by adding the file azkfile.json"

-- TODO: Add box name validate
local function create_manifest(path, file)
  -- Detect project type
  local msgs = "Enter a box: "
  local detected = detect.inspect(path)
  if detected then
    msgs = shell.format("Enter a box (default: %{yellow}%s%{reset}): ", detected.box)
  end

  local data = {}
  local box  = nil
  while true do
    -- Capture box name
    box = shell.capture(msgs)

    -- Use default
    if detected and box == "" then
      data = detected
      break
    elseif stringx.strip(box) ~= "" then
      data["box"] = box
      break
    end
    shell.error("[init] '%s' is a invalid box name", box)
  end

  data["app_id"] = app.new_id()
  detect.render(data, file)
end

function command.run(...)
  local args = {...}

  -- Only show id
  if args[1] == "--id" or args[1] == "-i" then
    shell.print(app.new_id())
    return
  end

  local path = args[1] or "."
  local file = path .. "/" .. azk.manifest

  -- Already?
  if fs.is_regular(file) then
    shell.error("[init] '%s' already exists", file)
    return
  end

  -- Create a new
  create_manifest(path, file)

  shell.info("[init] '%s' generated", file)
end

return command
