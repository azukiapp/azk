defmodule Azk.Cli.Commands.Init do
  use Azk.Cli.Command

  def run(app_path, argv) do
    IO.puts("#{:uuid.to_string(:uuid.uuid3(:uuid.uuid4, app_path))}")
  end
end
