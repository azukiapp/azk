local pcall = pcall
local type = type
local raises = require 'Spore'.raises
local json = require 'json'

_ENV = nil
local m = {}

function m:call (req)
    local spore = req.env.spore
    if spore.payload and type(spore.payload) == 'table' then
        spore.payload = json.encode(spore.payload)
        req.headers['content-type'] = 'application/json'
    end
    req.headers['accept'] = 'application/json'
    return  function (res)
                if res.headers['content-type']:match("application/json") and type(res.body) == 'string' and res.body:match'%S' then
                    local r, msg = pcall(function ()
                        res.body = json.decode(res.body)
                    end)
                    if not r then
                        if spore.errors then
                            spore.errors:write(msg, "\n")
                            spore.errors:write(res.body, "\n")
                        end
                        if res.status == 200 then
                            raises(res, msg)
                        end
                    end
                end
                return res
            end
end

return m
