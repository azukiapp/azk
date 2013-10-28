local utils = {}

function utils.switch(c)
  local swtbl = {
    casevar = c,
    caseof = function (self, code)
      local f
      if (self.casevar) then
        f = code[self.casevar] or code.default
      else
        f = code.missing or code.default
      end
      if f then
        if type(f)=="function" then
          return f(self.casevar,self)
        else
          error("case "..tostring(self.casevar).." not a function")
        end
      end
    end
  }
  return swtbl
end

return utils
