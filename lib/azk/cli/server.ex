defmodule Azk.Cli.Server do
  @moduledoc false

  use GenServer.Behaviour

  defrecord Config, project: nil

  def start_link(args) do
    :gen_server.start_link({ :local, __MODULE__ }, __MODULE__, args, [])
  end

  def call(arg) do
    :gen_server.call(__MODULE__, arg, 30_000)
  end

  def cast(arg) do
    :gen_server.cast(__MODULE__, arg)
  end

  ## Callbacks

  def init(args) do
    project = Keyword.get(args, :project, System.cwd!)
    { :ok, Config[project: project] }
  end

  def handle_call(:project, _from, config) do
    { :reply, config.project, config }
  end

  def handle_cast({:project, project}, config) do
    { :noreply, config.project(project) }
  end
end
