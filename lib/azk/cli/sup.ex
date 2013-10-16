defmodule Azk.Cli.Sup do
  @moduledoc false
  use Supervisor.Behaviour

  def start_link(args) do
    :supervisor.start_link(__MODULE__, [args])
  end

  def init(args) do
    tree = [worker(Azk.Cli.Server, args)]
    supervise(tree, strategy: :one_for_one)
  end
end

