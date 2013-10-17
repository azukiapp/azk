defmodule Azk.Cli.Test do
  use Azk.TestCase

  test "show version" do
    version = "Azk #{Mix.project[:version]}\n"
    assert version == capture_io(fn ->
      Azk.Cli.run ["--version"]
    end)
    assert version == capture_io(fn ->
      Azk.Cli.run ["-v"]
    end)
  end
end
