defmodule Azk.Bin.Azk.Test do
  use Azk.TestCase
  alias Mix.Shell

  test "show version" do
    version = "Azk #{Mix.project[:version]}\n"
    assert {0, version} == run_azk("--version")
    assert {0, version} == run_azk("-v")
  end

  test "run correctly even when other directory" do
    File.cd!(__DIR__, fn ->
      {result, _out} = run_azk("-v")
      assert 0 == result
    end)
  end
end
