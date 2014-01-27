local azk   = require('azk')
local shell = require('azk.cli.shell')
local uuid  = require('azk.utils.native.uuid')
local box   = require('azk.box')
local agent = require('azk.agent')
local fs    = require('azk.utils.fs')

local path     = require('pl.path')
local dir      = require('pl.dir')
local pl_utils = require('pl.utils')
local tablex   = require('pl.tablex')

local luker = require('luker')
local json  = require('json')

local app = {}
local i18n_f = azk.i18n.module("app")

local function __find_manifest(target)
  return #(dir.getfiles(target, azk.manifest)) == 1
end

-- TODO: Fixing windows root
function app.find_manifest(target)
  if __find_manifest(target) then
    return true, path.join(target, azk.manifest)
  end

  target = path.normpath(path.join(target, ".."))
  if target ~= "/" then
    return app.find_manifest(target)
  end

  return false, nil, i18n_f("no_such", { file = azk.manifest })
end

local function parse_box(value, file)
  -- Relative box
  if value:match("^%..*$") then
    return box.parse(path.normpath(path.join(
      path.dirname(file), value
    )))
  end
  return box.parse(value)
end

function app.new(P)
  local result, file, err = app.find_manifest(P)
  if not result then
    return result, file, err
  end

  local content = json.decode(pl_utils.readfile(file))
  local repository = "azk/apps/" .. content['id']
  local data = {
    -- App data
    id        = content['id'],
    manifest  = file,
    content   = content,
    from      = parse_box(content['box'], file),
    envs      = content.envs or {},
    work_path = path.join(azk.apps_path, content['id']),

    -- Box info
    ['type']   = "app",
    repository = repository,
    image      = repository .. ":latest",
    path       = path.dirname(file),
  }

  return true, data
end

local function new_name(label, id)
  return ("%s.%s.%s"):format(id, label, app.new_id())
end

local function prepare_to_run(data)
  local services_path = path.join(data.work_path, "services")
  fs.mkdir_p(services_path)

  local _, mount_app  = agent.mount(data.path)
  local _, mount_log  = agent.mount(services_path)

  return  function(label)
    local name = new_name(label or "exec", data.id)
    return {
      Image   = data.image,
      Volumes = { ["/azk/app"] = {}, ["/azk/services"] = {} },
      WorkingDir = "/azk/app",

      Binds = {
        ("%s:/azk/app"):format(mount_app),
        ("%s:/azk/services"):format(mount_log),
      },
      Env   = { "AZK_NAME=" .. name },
      Name  = name,
    }
  end
end

local function call_to_run(options)
  return luker.run_container({ payload = options })
end

function app.run(data, cmd, ...)
  local options = prepare_to_run(data)()

  if cmd == "-i" then
    options.Tty = true
    options.OpenStdin = true
    options.AttachStdin = true
    options.Cmd = {...}
  else
    options.Cmd = {cmd, ...}
  end

  return call_to_run(options)
end

function app.service(data, service, action, options, pp)
  local options  = tablex.merge({
    number   = action ~= "stop" and 1 or 0,
    timeout  = 5,
    progress = function() end
  }, options or {}, true)
  local services = data.content.services or {}

  -- Guard
  if not services[service] then
    error({ msg = i18n_f("not_service", { service = service })})
  end

  -- Actual status
  local containers = luker.containers({ all = true })
  containers = tablex.filter(containers, function(container)
    return container.Names[1]:match(
      ("^/%s%%.service%%.%s"):format(data.id, service)
    )
  end)

  if action == "status" then
    return true, containers
  else
    if #containers ~= options.number then
      local diff = options.number - #containers

      -- kill
      if diff < 0 then
        diff = diff * -1
        tablex.foreachi(tablex.range(1, diff), function(i)
          luker.stop_container({ id = containers[i].Id, t = options.timeout})
          luker.remove_container({ Id = containers[i].Id })
          options.progress(-1)
        end)
      -- Start
      else
        local logfile = path.join("/azk/services", service .. ".log")
        local command = ("(%s) &>>%s"):format(services[service].command, logfile)
        local run_opt = prepare_to_run(data)

        local envs = tablex.merge(
          (data.envs["dev"] or {}).envs or {},
          services[service].envs or {},
          true
        )

        tablex.foreachi(tablex.range(1, diff), function()
          local label   = "service." .. service
          local run_opt = run_opt(label)
          run_opt.Daemon = true
          run_opt.Cmd = { "/bin/bash", "-c", command, "&>/dev/null" }

          -- Ports
          if service == "web" then
            run_opt.Ports = { ["8080/tcp"] = {} }
            run_opt.Env[#run_opt.Env+1] = "PORT=8080"
          end

          -- Env
          tablex.foreach(envs, function(value, var)
            run_opt.Env[#run_opt.Env+1] = ("%s=%s"):format(var, value)
          end)

          call_to_run(run_opt)
          options.progress(1)
        end)
      end
    end
    return true
  end
end

function app.new_id()
  return uuid.new_clear(15)
end

return app
