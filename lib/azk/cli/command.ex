defmodule Azk.Cli.Command do
  use Behaviour
  alias :ordsets, as: Ordset

  @moduledoc """
  A simple module that provides conveniences for creating,
  loading and manipulating commands.
  """

  @doc """
  A command needs to implement `run` which receives
  a list of command line args.
  """
  defcallback run([binary]) :: any

  @doc false
  defmacro __using__(_opts) do
    quote do
      Enum.each [:shortdoc, :azkfile_required],
        &(Module.register_attribute(__MODULE__, &1, persist: true))

      @azkfile_required true

      @behaviour Azk.Cli.Command
    end
  end

  @doc """
  Receives a command name and retrieves the command module.

  ## Exceptions

  * `Azk.Cli.NoCommandError` - raised if the command could not be found;
  * `Azk.Cli.InvalidCommandError` - raised if the command is not a valid `Azk.Cli.Command`
  """
  def get(command) do
    case Mix.Utils.command_to_module(command, Azk.Cli.Commands) do
      { :module, module } ->
        if is_command?(module) do
          module
        else
          raise Azk.Cli.InvalidCommandError, command: command
        end
      { :error, _ } ->
        raise Azk.Cli.NoCommandError, command: command
    end
  end

  @doc """
  Runs a `command` with the given `args`.

  It may raise an exception if the command was not found
  or it is invalid. Check `get/1` for more information.
  """
  def run(command, args // []) do
    module = get("#{command}")
    module.run(args)
  end

  @doc """
  Gets the moduledoc for the given command `module`.
  Returns the moduledoc or `nil`.
  """
  def moduledoc(module) when is_atom(module) do
    case module.__info__(:moduledoc) do
      { _line, moduledoc } -> moduledoc
      nil -> nil
    end
  end

  @doc """
  Gets the shortdoc for the given command `module`.
  Returns the shortdoc or `nil`.
  """
  def shortdoc(module) when is_atom(module) do
    case List.keyfind module.__info__(:attributes), :shortdoc, 0 do
      { :shortdoc, [shortdoc] } -> shortdoc
      _ -> nil
    end
  end

  def azkfile_required?(module) when is_atom(module) do
    case List.keyfind module.__info__(:attributes), :azkfile_required, 0 do
      { :azkfile_required, [azkfile_required] } -> azkfile_required
      _ -> true
    end
  end

  defp is_command?(module) do
    function_exported?(module, :run, 1)
  end
end
