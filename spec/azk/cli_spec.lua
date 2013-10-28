local cli = require("azk/cli")

describe("Azk #cli test", function()
  it("should be return version", function()
    cli.run("--version")
  end)
end)
