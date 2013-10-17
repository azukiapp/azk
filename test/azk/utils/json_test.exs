defmodule Azk.Utils.JSON.Test do
  use Azk.TestCase
  alias Azk.Utils.JSON

  test "normal encode support" do
    data = [user: "daniel"]
    result = JSON.decode(JSON.encode(data))

    assert data[:user], result["user"]
  end

  test "suport encode HashDict" do
    hash = HashDict.new(user: "foo", name: "Daniel")
    objt = JSON.decode(JSON.encode(hash))

    assert hash[:user], objt["user"]
    assert hash[:name], objt["name"]
  end

  test "check is a json" do
    assert JSON.is_json("[]")
    assert JSON.is_json("[//Comment\n]", [:comments])
    {:incomplete, func} = JSON.is_json("[")
    assert is_function(func)
  end
end

