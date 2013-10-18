defmodule Azk.Cli.Commands.Invalid do; end
defmodule Azk.Cli.Commands.Test.Command do
  use Azk.Cli.Command

  @shortdoc "This is short documentation, see"
  @azkfile_required false

  @moduledoc """
  A test task.
  """
  def run(_, args) do
    "Hello #{inspect(args)}"
  end
end

defmodule Azk.Cli.Commands.Test.Required do
  use Azk.Cli.Command
  def run(azkfile, _), do: Utils.parse_azkfile!(azkfile)
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
    File.cd! fixture_path(:no_azkfile), fn ->
      msg = "Could not find a #{Azk.azkfile} in this application folder"
      assert_raise Azk.Cli.NoAzkfileError, msg, fn ->
        Command.run("test.required")
      end
    end
  end

  test "azkfile path chain to run" do
    prj_path = fixture_path(:full_azkfile)
    File.cd! prj_path, fn ->
      file = Azk.Cli.Utils.find_azkfile!(prj_path)
      data = Azk.Cli.Utils.parse_azkfile!(file)
      assert Command.run("test.required") == data
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

  test :azkfile_required? do
    refute Command.azkfile_required?(TestCommand)
    assert Command.azkfile_required?(Required)
  end
end
