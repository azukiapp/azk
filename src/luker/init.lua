local Spore = require 'Spore'
local agent = require 'azk.agent'

local json_format = require 'luker.json_format'

local docker = Spore.new_from_lua {
  base_url = 'http://azk-agent:4243/',
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
local intermediate = {
  build_image = function(options)
    target  = options['target']
    tag     = options['tag']

    local _, dir = agent.mount(target)
    return agent.run("docker", "build", "-q", "-rm", "-t", tag, dir)
  end
}

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
