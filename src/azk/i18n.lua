local i18n   = require('i18n')
local tablex = require('pl.tablex')
local colors = require('ansicolors')

i18n.load({
  en = {
    provision = {
      label    = colors("%{yellow}image%{reset}"),
      --label    = "image",
      check    = "[%{label}] check image: %{image}",
      detected = "[%{label}] '%{type}' box type detected",
      making   = "[%{label}] provision it ...",
      provisioned = "[%{label}] provisioned: %{image}",
      -- Search
      searching = "[%{label}] searching: %{image}",
      already   = "[%{label}] already provisioned: %{image}",
      not_found = "[%{label}] not found: %{image}",
      -- Dependecie
      dependence = {
        searching = "[%{label}] searching depedence: %{image}",
        not_found = "[%{label}] not found depedence: %{image}",
        not_found_it = "[%{label}] not found depedence, making: %{image}"
      }
    }
  }
})

i18n.setLocale('en')

function i18n.module(mod)
  local label = i18n(mod .. ".label")
  return function(msg, options)
    options = tablex.merge({ label = label }, options or {}, true)
    return i18n(mod .. "." .. msg, options)
  end
end

return i18n
