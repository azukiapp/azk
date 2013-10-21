defmodule Azk.Cli.AzkApp.Test do
  use Azk.TestCase
  alias Azk.Cli.AzkApp
  alias Azk.Cli.Utils

  test :is_record do
    assert is_record(AzkApp.new, AzkApp)
    assert AzkApp.new(__DIR__).path == __DIR__
  end

  test "set azkfile based in options" do
    path = fixture_path(:full_azkfile)
    app  = AzkApp.new(path: path)
    assert path == app.path
    assert Utils.find_azkfile!(path) == app.azkfile
  end

  test "capture the path from cwd" do
    path = fixture_path(:full_azkfile)
    File.cd! path, fn ->
      app = AzkApp.new()
      assert path == app.path
      assert Utils.find_azkfile!(path) == app.azkfile
    end
  end

  test "parse azkfile and set values" do
    path = fixture_path(:full_azkfile)
    File.cd! path, fn ->
      app = AzkApp.new().load!
      refute nil == app.id
    end
  end

  test "raise exception azkfile not found" do
    app_path = fixture_path(:no_azkfile)
    File.cd! app_path, fn ->
      assert_raise Azk.Cli.NoAzkfileError, %r/#{app_path}/, fn ->
        AzkApp.new.load!
      end
    end
  end

  test "get azk folder path" do
    path = fixture_path(:full_azkfile)
    File.cd! path, fn ->
      apps_folder = Path.join([Azk.Config.get(:azk_agent_path), "apps"])
      app = AzkApp.new.load!
      assert Path.join([apps_folder, app.id]) == app.mount_folder
    end
  end
end
