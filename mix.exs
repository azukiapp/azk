defmodule Azk.Mixfile do
  use Mix.Project

  def project do
    [ app: :azk,
      version: "0.0.1",
      elixir: "~> 0.10.3",
      deps: deps,
      configs: [
        azk_agent_host: {:from_env, :AZK_AGENT_HOST, "192.168.50.4"},
        azk_agent_path: {:from_env, :AZK_AGENT_APTH, "/var/lib/azk"},
        overrides: [ exdocker: [ ] ]
      ]
    ]
  end

  # Configuration for the OTP application
  def application do
    []
  end

  # Returns the list of dependencies in the format:
  # { :foobar, "~> 0.1", git: "https://github.com/elixir-lang/foobar.git" }
  defp deps do
    [
      {:uuid, github: "gatement/erlang-uuid", commit: "1a4e600f56044c10227a9e5bb5d7c63c7bcb83f6"},
      {:jsx , github: "talentdeficit/jsx", compile: "rebar compile" },
      {:tree_config, github: "nuxlli/tree_config"}
    ]
  end
end
