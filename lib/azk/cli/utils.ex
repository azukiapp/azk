defmodule Azk.Cli.Utils do
  alias Azk.Utils.JSON

  @doc """
  Search to #{Azk.azkfile} in project path
  """
  @spec find_azkfile(String.t) :: {:ok, String.t} | {:error, String.t}
  def find_azkfile(project_path) do
    file = Path.join(project_path, Azk.azkfile)
    case File.regular?(file) do
      true -> {:ok, file}
      _ -> {:error,
        "#{Azk.azkfile} not found in project path (#{project_path})"
      }
    end
  end

  @spec find_azkfile!(String.t) :: String.t | no_return
  def find_azkfile!(path) do
    return_or_raise(find_azkfile(path))
  end

  @doc """
  Parse de #{Azk.azkfile}
  """
  @spec parse_azkfile(String.t) :: {:ok, Keyword.t} | {:error, String.t}
  @parse_opts [:comments, {:labels, :atom}]
  def parse_azkfile(path) do
    {:ok, JSON.decode(File.read!(path), @parse_opts)}
  rescue
    File.Error -> {:error,
      "#{path} not exist"
    }
    ArgumentError -> {:error,
      "Invalid #{path} format"
    }
  end

  @spec parse_azkfile!(String.t) :: Keyword.t | no_return
  def parse_azkfile!(path) do
    return_or_raise(parse_azkfile(path))
  end

  defp return_or_raise({:ok, result}), do: result
  defp return_or_raise({:error, msg}), do: raise msg
end
