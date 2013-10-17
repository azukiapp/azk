defmodule AzkTest do
  use ExUnit.Case

  test "return a azkfile name" do
    assert "azkfile.json" == Azk.azkfile
  end
end
