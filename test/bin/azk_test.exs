defmodule Azk.Bin.Azk.Test do
  use Azk.TestCase
  alias Mix.Shell

  test "run correctly even when other directory" do
    File.cd!(__DIR__, fn ->
      {result, _out} = run_azk("-v")
      assert 0 == result
    end)
  end
end
