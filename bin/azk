#!/usr/bin/env elixir
# vim: ft=elixir

# Azk path
azk_path = Path.expand(Path.join([__DIR__, ".."]))

File.cd! azk_path, fn ->
  # Start mix
  Mix.start

  # Load azk/mix.exs and set depspath
  Code.load_file Path.join([azk_path, "mix.exs"])
  Mix.loadpaths
end

# Run azk command
Azk.Cli.run
