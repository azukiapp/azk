defmodule Azk do
  use Application.Behaviour

  # See http://elixir-lang.org/docs/stable/Application.Behaviour.html
  # for more information on OTP Applications
  def start(_type, args) do
    start(args)
  end

  def start(args) do
    Azk.Supervisor.start_link(args)
  end

  def azkfile do
    "azkfile.json"
  end
end
