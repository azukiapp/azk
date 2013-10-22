defmodule Azk.Cli.Commands.Exec.Test do
  use Azk.TestCase

  alias Azk.Cli.Commands.Exec
  alias Azk.Deployers.Bindfs

  setup_all do
    app = Azk.Cli.AzkApp.new(fixture_path(:full_azkfile)).load!
    Bindfs.unsync!(app.path, app.mount_folder)
    {:ok, app: app}
  end

  teardown var do
    Bindfs.unsync!(var[:app].path, var[:app].mount_folder)
    :ok
  end

  test "deploy application", var do
    app = var[:app]
    out = capture_io fn ->
      Exec.run(app.path, [])
    end

    assert Regex.match?(%r/Deploy app/, out)
    assert Bindfs.sync?(app.path, app.mount_folder)
  end
end
