defmodule Azk.Cli.Utils.Test do
  use Azk.TestCase
  alias Azk.Cli.Utils

  test "search a azkfile" do
    pj_path = fixture_path(:full_azkfile)
    file    = Path.join(pj_path, Azk.azkfile)
    assert {:ok, file} == Utils.azkfile(pj_path)
  end

  test "return a error azkfile not found" do
    {:error, msg} = Utils.azkfile(__DIR__)
    assert Regex.match?(%r/not found.*#{__DIR__}/, msg)
  end
end
