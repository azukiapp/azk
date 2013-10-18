defmodule Azk.Cli.Command do
  use Behaviour
  alias Azk.Cli.Utils

  @moduledoc """
  A simple module that provides conveniences for creating,
  loading and manipulating commands.
  """

  @doc """
  A command needs to implement `run` which receives
  a list of command line args.
  """
  defcallback run(Keyword.t, [binary]) :: any

  @doc false
  defmacro __using__(_opts) do
    quote do
      alias Azk.Cli.Utils

      Enum.each [:shortdoc, :azkfile_required],
        &(Module.register_attribute(__MODULE__, &1, persist: true))

      @azkfile_required true

      @behaviour Azk.Cli.Command
    end
  end

  @doc """
  Loads all commands in all code paths.
  """
  def load_all, do: load_commands(:code.get_path)

  @doc """
  Loads all commands in the given `paths`.
  """
  def load_commands(paths) do
    Enum.reduce(paths, [], fn(path, matches) ->
      { :ok, files } = :erl_prim_loader.list_dir(path |> :unicode.characters_to_list)
      Enum.reduce(files, matches, &(match_commands(&1, &2)))
    end)
  end

  defp match_commands(file_name, modules) do
    if Regex.match?(%r/Elixir\.Azk\.Cli\.Commands\..*\.beam/, file_name) do
      mod = Path.rootname(file_name, '.beam') |> list_to_atom
      if Code.ensure_loaded?(mod), do: [mod | modules], else: modules
    else
      modules
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
    file   = case Utils.find_azkfile(System.cwd!) do
      {:ok, file} -> file
      {:error, file, _} -> file
    end

    if azkfile_required?(module) && not(File.regular?(file)) do
      raise Azk.Cli.NoAzkfileError
    end

    module.run(file, args)
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
    function_exported?(module, :run, 2)
  end
end
