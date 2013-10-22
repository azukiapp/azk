defexception Azk.Deployer.DeployerError, origin_path: nil, destiny_path: nil, azk_error: true do
  def message(exception) do
    "Unable to deploy the application, from: " <>
    "#{origin_path(exception)} to #{destiny_path(exception)}"
  end
end

defmodule Azk.Deployer do
  use Behaviour

  @moduledoc """
  A simple module that provides conveniences for synchronization,
  checking and cleaning the files from app path to a environment.
  """

  @doc """
  A deployer needs to implement `sync!` which receives
  a `app path` and `app id`. With this information it
  should synchronize files and / or establish a process to make.
  """
  defcallback sync!(binary, binary) :: any

  @doc """
  TODO: Document this
  """
  defcallback sync?(binary, binary) :: any

  @doc """
  TODO: Document this
  """
  defcallback unsync!(binary, binary) :: any

  @doc false
  defmacro __using__(_opts) do
    quote do
      alias Azk.Deployer.DeployerError
      @behaviour unquote(__MODULE__)
    end
  end
end
