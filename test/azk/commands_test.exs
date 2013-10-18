defmodule Azk.Cli.Commands.Invalid do; end
defmodule Azk.Cli.Commands.Test.Command do
  use Azk.Cli.Command

  @shortdoc "This is short documentation, see"

  @moduledoc """
  A test task.
  """
  def run(args) do
    "Hello #{inspect(args)}"
  end
end

defmodule Azk.Cli.Commands.Test.NotRequired do
  use Azk.Cli.Command
  @azkfile_required false
  def run(_), do: nil
end

defmodule Azk.Cli.Commands.Test do
  use Azk.TestCase
  alias Azk.Cli.Command
  alias Azk.Cli.Commands.Test.Command, as: TestCommand
  alias Azk.Cli.Commands.Test.NotRequired

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
    assert Command.azkfile_required?(TestCommand)
    refute Command.azkfile_required?(NotRequired)
  end
end
