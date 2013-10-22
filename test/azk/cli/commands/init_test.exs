defmodule Azk.Cli.Command.Init.Test do
  use Azk.TestCase
  alias Azk.Cli.Commands.Init

  test "generate aid (azk app id)" do
    path = fixture_path(:no_azkfile)
    aaid = String.strip(capture_io(fn ->
      Init.run(path, [])
    end))
    assert :uuid.is_v3('#{aaid}')
  end
end
