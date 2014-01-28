local i18n   = require('i18n')
local tablex = require('pl.tablex')
local colors = require('ansicolors')

i18n.load({
  en = {
    app = {
      label   = colors("%{blue}app%{reset}"),
      no_such = colors("no such '%{yellow}%<file>.s%{reset}' in current project"),
    },

    service = {
      label    = colors("%{green}service%{green}"),
      not_service = colors("[%<label>.s] not such service '%{red}%<service>.s%{reset}' for this project"),
      scale  = "[%{label}] scale service '%{service}' from %{from} to %{to} instances",
      up     = "[%{label}] starting service: '%{name}'",
      down   = "[%{label}] stoping service: '%{name}'",
      running = colors("[%<label>.s] %{green}running%{reset}, %<instances>.d instance(s)"),
      not_running = colors("[%<label>.s] %{red}not running"),
    },

    provision = {
      label    = colors("%{yellow}image%{reset}"),
      check    = "[%{label}] check image: %{image}",
      detected = colors("[%<label>.s] '%{blue}%<type>.s%{reset}' box type detected"),
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
    },

    command_exec = {
      label = colors("%{green}exec%{reset}"),
      short_help = "Run an executable with the image-app",
    },

    command_service = {
      label = colors("%{green}service%{reset}"),
    },

    command_ps = {
      label = colors("%{green}processes%{reset}"),
      short_help    = "Displays a information about all of application process",
      not_provision = "[%{label}] application image not found, try 'azk provision'",
      line  = colors("%{blue}%<id>-13s%{reset}"),
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
