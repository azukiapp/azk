local Spore  = require 'Spore'
local agent  = require 'azk.agent'
local utils  = require 'azk.utils'
local tablex = require 'pl.tablex'
local os     = require 'os'

local json_format = require 'luker.json_format'
local docker_url  = os.getenv('DOCKER_HOST') or 'azk-agent'

local docker = Spore.new_from_lua {
  base_url = 'http://' .. docker_url .. ':4243/v1.8/',
  version = "1.7",
  methods = {
    version = {
      path = '/version',
      method = 'GET',
    },
    info = {
      path = '/info',
      method = 'GET',
    },
    containers = {
      path = '/containers/json',
      method = 'GET',
      optional_params = {
        "all",
      }
    },
    container = {
      path = '/containers/:id/json',
      method = 'GET',
      required_params = {
        "id",
      }
    },
    create_container = {
      path = '/containers/create',
      method = 'POST',
      required_payload = true,
      options_params = {
        "name"
      },
    },
    start_container = {
      path = '/containers/:id/start',
      method = 'POST',
      required_payload = true,
      required_params = {
        "id",
      }
    },
    stop_container = {
      path = '/containers/:id/stop',
      method = 'POST',
      required_params = {
        "id",
      },
      optional_params = {
        "t",
      },
    },
    remove_container = {
      path = '/containers/:Id',
      method = 'DELETE',
      required_params = {
        "Id",
      },
    },
    images = {
      path = '/images/json',
      method = 'GET',
    },
    image = {
      path = '/images/:image/json',
      method = 'GET',
      required_params = {
        'image'
      }
    },
    tag_image = {
      path = '/images/:image/tag',
      required_params = {
        "image",
        "repo",
      },
      optional_params = {
        "force",
        "tag",
      },
      method = 'POST',
    },
    remove_image = {
      path = '/images/:image',
      method = "DELETE",
      required_params = {
        "image",
      }
    }
  }
}

-- TODO: sugest support a module in spore:enable
local t = docker.middlewares
t[#t+1] = {
  cond = function() return true end,
  code = function(req)
    return json_format.call(nil, req)
  end
}

-- Don't implemented yet
-- TODO: Replacing this by api
-- https://code.google.com/p/lua-larc
-- https://github.com/lipp/lua-websockets
-- http://rachid.koucha.free.fr/tech_corner/pty_pdip.html
-- https://github.com/dotcloud/docker-py
-- http://w3.impa.br/~diego/software/luasocket/http.html#request
local luker = {}
local intermediate = {
  build_image = function(options)
    local target = options.target
    local tag    = options.tag

    local _, dir = agent.mount(target)
    return agent.run("docker", "build", "-q", "-rm", "-t", tag, dir)
  end,

  pull_image = function(options)
    local image = options.image
    return agent.run("docker", "pull", image)
  end,

  run_container = function(options)
    local options = options.payload

    local cmd = {
      "docker", "run",
      "-w", options.WorkingDir or "/"
    }

    if options.Name then
      cmd[#cmd+1] = "-name"
      cmd[#cmd+1] = options.Name
    end

    if options.Tty then
      cmd = tablex.insertvalues(cmd, 1, { "-t" })
      cmd[#cmd+1] = "-t"
      cmd[#cmd+1] = "-i"
    end

    if options.Daemon then
      cmd[#cmd+1] = "-d"
    else
      cmd[#cmd+1] = "-rm"
    end

    -- Env
    tablex.foreachi(options.Env or {}, function(var)
      cmd[#cmd+1] = "-e"
      cmd[#cmd+1] = var
    end)

    -- Ports
    tablex.foreach(options.Ports or {}, function(_, port)
      cmd[#cmd+1] = "-p"
      cmd[#cmd+1] = port
    end)

    -- Mount
    tablex.foreachi(options.Binds or {}, function(volume, i)
      cmd[#cmd+1] = "-v"
      cmd[#cmd+1] = ('"%s"'):format(volume)
    end)

    cmd[#cmd+1] = options.Image
    cmd = tablex.insertvalues(cmd, #cmd+1, options.Cmd or {})

    --return cmd
    return agent.run(unpack(cmd))
  end,
}

luker = intermediate

return setmetatable(intermediate, {
  __index = function(_table, key)
    local entry = docker[key]
    if entry then
      return function(...)
        local res = entry(docker, ...)
        return res.body, res.status
      end
    end
    error(key .." entrypoint not implement")
  end
})
