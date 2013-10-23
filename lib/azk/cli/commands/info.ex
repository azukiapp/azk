defmodule Azk.Cli.Commands.Info do
  use Azk.Cli.Command

  def run(app_path, _argv) do
    app = AzkApp.new(app_path).load!
    IO.inspect(app)
  end
end
