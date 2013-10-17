defmodule Azk.Cli.Utils do
  @doc """
  Search to #{Azk.azkfile} in project path
  """
  @spec azkfile(String.t) :: String.t
  def azkfile(project_path) do
    file = Path.join(project_path, Azk.azkfile)
    case File.regular?(file) do
      true -> {:ok, file}
      _ -> {:error,
        "#{Azk.azkfile} not found in project path (#{project_path})"
      }
    end
  end
end
