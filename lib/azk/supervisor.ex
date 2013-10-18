defmodule Azk.Supervisor do
  use Supervisor.Behaviour

  def start_link(args) do
    :supervisor.start_link(__MODULE__, [args])
  end

  def init(args) do
    children = [
      # Define workers and child supervisors to be supervised
      #supervisor(Azk.Cli.Sup, args)
    ]

    # See http://elixir-lang.org/docs/stable/Supervisor.Behaviour.html
    # for other strategies and supported options
    supervise(children, strategy: :one_for_one)
  end
end
