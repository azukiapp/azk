local luker  = require('luker')
local helper = require('spec.spec_helper')

describe("Luker library", function()
  it("should support get version", function()
    local version = luker.version()
    assert.is.match(version.Version, "^[0-9%.]+$")
    assert.is.match(version.GoVersion, "^go[0-9%.]+$")
  end)

  it("should support get infomartion", function()
    local info = luker.info()
    assert.is.equal("number", type(info.Containers))
    assert.is.match(info.KernelVersion, "^[0-9%.]+$")
  end)

  it("should raise a error for invalid entry point", function()
    local _, err = pcall(luker.not_exist)
    assert.are.match(err, "key entrypoint not implement")
  end)

  it("should support get images", function()
    local images = luker.images()
    assert.is.equal("table", type(images))

    local ubuntu = head(filter(function(image)
      return image.RepoTags[1] == "ubuntu:12.04"
    end, images))

    assert.is.equal("number", type(ubuntu.Created))
    assert.is.equal("ubuntu:12.04", ubuntu.RepoTags[1])
  end)

  it("should support get containers", function()
    local containers = luker.containers()
    assert.is.equal("table", type(containers))
  end)
end)
