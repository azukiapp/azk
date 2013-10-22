defmodule Azk.Cli.AzkApp do
  alias Azk.Cli.Utils
  alias Azk.Config

  # Fields
  @fields [ id: nil, azkfile: nil, path: nil, box: nil,
    options: [], envs: [], builds: [], services: []
  ]

  @type t :: __MODULE__.t

  # Record def
  Record.deffunctions(@fields, __ENV__)
  Record.import __MODULE__, as: :app

  defoverridable new: 1

  def new(path) when is_bitstring(path) do
    new(path: path)
  end

  def new(opts) do
    opts = Keyword.merge([
      path: System.cwd!,
      azkfile: find_azkfile(opts[:path] || System.cwd!)
    ], opts)
    super opts
  end

  # TODO: Valid azkfile
  @doc """
  Load app information from #{Azk.azkfile}
  """
  @spec load!(t) :: t
  def load!(app(azkfile: azkfile, path: path) = app) do
    case Utils.parse_azkfile(azkfile) do
      {:ok, azkfile} ->
        app(app, id: azkfile[:id])
      _ ->
        raise Azk.Cli.NoAzkfileError.new(app_folder: path)
    end
  end

  @doc """
  Return a path to mount app in azk folder
  """
  @spec mount_folder(t) :: String.t
  def mount_folder(app(id: id)) do
    Path.join([Config.get(:azk_agent_path), "apps", id])
  end

  defp find_azkfile(path) do
    case Utils.find_azkfile(path) do
      {:ok, file} -> file
      {_, file, _} -> file
    end
  end
end
