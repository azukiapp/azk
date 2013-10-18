defmodule Azk.Cli.Utils.Test do
  use Azk.TestCase
  alias Azk.Cli.Utils

  test "search a azkfile" do
    pj_path = fixture_path(:full_azkfile)
    file    = Path.join(pj_path, Azk.azkfile)
    assert {:ok, file} == Utils.find_azkfile(pj_path)
  end

  test "return a error azkfile not found" do
    file = Path.join(__DIR__, Azk.azkfile)
    {:error, ^file, msg} = Utils.find_azkfile(__DIR__)
    assert Regex.match?(%r/not found.*#{__DIR__}/, msg)
  end

  test "raise exception if not found azkfile" do
    file = Utils.find_azkfile!(fixture_path(:full_azkfile))
    assert File.regular? file

    assert_raise RuntimeError, %r/not found/, fn ->
      Utils.find_azkfile!(fixture_path(:no_azkfile))
    end
  end

  test "parse the azkfile and return a data" do
    {:ok, file} = Utils.find_azkfile(fixture_path(:full_azkfile))
    {:ok, data} = Utils.parse_azkfile(file)
    assert "3bc93647-c32c-49e0-8786-242f35ca7340" == data[:id]
  end

  test "return a invalid error to invalid json" do
    {:ok, file}   = Utils.find_azkfile(fixture_path(:invalid_azkfile))
    {:error, msg} = Utils.parse_azkfile(file)
    assert Regex.match? %r/Invalid #{file} format/, msg
  end

  test "return a file not found if azkfile not exist" do
    file = Path.join(__DIR__, Azk.azkfile)
    {:error, msg} = Utils.parse_azkfile(file)
    assert Regex.match? %r/#{file} not exist/, msg
  end

  test "raise erro for invalid azkfile" do
    file = Utils.find_azkfile!(fixture_path(:full_azkfile))
    assert is_list(Utils.parse_azkfile!(file))

    file = Utils.find_azkfile!(fixture_path(:invalid_azkfile))
    assert_raise RuntimeError, %r/#{file} format/, fn ->
      Utils.parse_azkfile!(file)
    end

    assert_raise RuntimeError, %r/not exist/, fn ->
      Utils.parse_azkfile!(Path.join([__DIR__, Azk.azkfile]))
    end
  end
end
