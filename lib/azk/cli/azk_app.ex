defmodule Azk.Cli.AzkApp do
  alias Azk.Cli.Utils
  alias Azk.Config

  defrecord Box, type: :git, address: nil, version: nil do
    @box_parse %r/(?<address>[^\#|.]*)\#?(?<version>.*)/g
    def new(box) when is_bitstring(box) do
      new(Regex.named_captures(@box_parse, box))
    end
  end

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
        app(app, [
          id: azkfile[:id],
          box: Box.new(azkfile[:box])
        ])
      _ ->
        raise Azk.Cli.NoAzkfileError.new(app_folder: path)
    end
  end

  @doc """
  Deploy app
  """
  @spec deploy!(t) :: any
  def deploy!(app(path: path) = this) do
    Azk.Deployers.Bindfs.sync!(path, mount_folder(this))
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
