defmodule Azk.Cli.Commands.Exec do
  use Azk.Cli.Command

  @shortdoc "Execute a single command in application context"

  @moduledoc """
  Execute a single command in application context.

  If the `image-app` is not provisioned, run a provision before.

  Examples:
      $ azk exec npm install
  """
  def run(app_path, argv) do
    app = AzkApp.new(path: app_path).load!
    IO.inspect {app, argv}
  end
end

