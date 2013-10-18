defmodule Azk.Cli.Commands.Invalid do; end
defmodule Azk.Cli.Commands.Test.Command do
  use Azk.Cli.Command

  @shortdoc "This is short documentation, see"

  @moduledoc """
  A test task.
  """
  def run(_, args) do
    "Hello #{inspect(args)}"
  end
end

defmodule Azk.Cli.Commands.Test.Required do
  use Azk.Cli.Command
  def run(app_path, _) do
    Azk.Cli.AzkApp.new(path: app_path).load!
  end
end

defmodule Azk.Cli.Commands.Test do
  use Azk.TestCase
  alias Azk.Cli.Command
  alias Azk.Cli.Commands.Test.Command, as: TestCommand
  alias Azk.Cli.Commands.Test.Required

  test :run do
    assert Command.run(:'test.command') == "Hello []"
    assert Command.run("test.command")  == "Hello []"

    msg = "The command unknown could not be found"
    assert_raise Azk.Cli.NoCommandError, msg, fn ->
      Command.run("unknown")
    end

    msg = "The command invalid does not respond to run/1"
    assert_raise Azk.Cli.InvalidCommandError, msg, fn ->
      Command.run("invalid")
    end
  end

  test "run with args" do
    assert Command.run("test.command", ["-v"]) == "Hello [\"-v\"]"
  end

  test "run raise a error if not found azkfile" do
    path = fixture_path(:no_azkfile)
    File.cd! path, fn ->
      msg = "Could not find a #{Azk.azkfile} in this application folder: #{path}"
      assert_raise Azk.Cli.NoAzkfileError, msg, fn ->
        Command.run("test.required")
      end
    end
  end

  test "azkfile path chain to run" do
    app_path = fixture_path(:full_azkfile)
    File.cd! app_path, fn ->
      app = Azk.Cli.AzkApp.new(path: app_path).load!
      assert Command.run("test.required") == app
    end
  end

  test :get do
    assert Command.get("test.command") == TestCommand

    msg = "The command unknown could not be found"
    assert_raise Azk.Cli.NoCommandError, msg, fn ->
      Command.get("unknown")
    end

    msg = "The command invalid does not respond to run/1"
    assert_raise Azk.Cli.InvalidCommandError, msg, fn ->
      Command.get("invalid")
    end
  end

  test :moduledoc do
    assert Command.moduledoc(TestCommand) == "A test task.\n"
  end

  test :shortdoc do
    assert Command.shortdoc(TestCommand) == "This is short documentation, see"
  end
end
