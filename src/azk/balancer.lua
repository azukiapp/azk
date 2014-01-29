local hiredis = require 'hiredis'

local balancer = {}
local __conn   = nil

function conn()
  if not __conn then
    __conn = hiredis.connect("azk-agent", 6379)
  end
  return __conn
end

function balancer.add(domain, target)
  conn():command("RPUSH", "frontend:" .. domain, target)
end

function balancer.init(domain, id)
  local result = conn():command("LRANGE", "frontend:" .. domain, 0, 0)
  if #result == 0 then
    balancer.add(domain, id)
  end
end

function balancer.remove(domain, target)
  conn():command("LREM", "frontend:" .. domain, 1, target)
end

return balancer
