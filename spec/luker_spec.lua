local luker  = require('luker')
local agent  = require('azk.agent')
local shell  = require('azk.cli.shell')
local hh     = require('spec.spec_helper')
local tablex = require('pl.tablex')
local path   = require('pl.path')

describe("Luker library", function()
  it("should support get version", function()
    local version, status = luker.version()
    assert.is.equal(200, status)
    assert.is.match(version.Version, "^[0-9%.]+$")
    assert.is.match(version.GoVersion, "^go[0-9%.]+$")
  end)

  it("should support get infomartion", function()
    local info, status = luker.info()
    assert.is.equal(200, status)
    assert.is.equal("number", type(info.Containers))
    assert.is.match(info.KernelVersion, "^[0-9%.]+$")
  end)

  it("should raise a error for invalid entry point", function()
    local _, err = pcall(function()
      return luker.not_exist
    end)
    assert.are.match(err, "not_exist entrypoint not implement")
  end)

  it("should support get images", function()
    local images, _ = luker.images()
    assert.is.equal("table", type(images))

    local ubuntu = tablex.filter(images, function(image)
      return image.RepoTags[1] == "ubuntu:12.04"
    end)[1]

    assert.is.equal("number", type(ubuntu.Created))
    assert.is.equal("ubuntu:12.04", ubuntu.RepoTags[1])
  end)

  it("should tag the ubuntu image", function()
    local ubuntu, _ = luker.image({ image = "ubuntu:12.04" })
    local result, status = luker.tag_image {
      image = "ubuntu:12.04",
      repo  = "azk",
      tag   = "test-tag",
    }

    assert.is.blank(result)
    assert.is.equal(201, status)

    local test, _ = luker.image({ image = "azk:test-tag" })
    assert.is.equal(ubuntu.id, test.id)
  end)

  it("should remove a imagem", function()
    local result, status = luker.tag_image {
      image = "ubuntu:12.04",
      repo  = "azk",
      tag   = "test-tag",
    }
    local result, status = luker.remove_image {
      image = "azk:test-tag"
    }

    assert.is.equal(200, status)
    assert.is_not.blank(result[1].Untagged)
  end)

  it("should support get containers", function()
    local containers, status = luker.containers()
    assert.is.equal(200, status)
    assert.is.equal("table", type(containers))
  end)

  describe("containers", function()
    local _, project = agent.mount(path.currentdir())

    local options = {
      payload = {
        Cmd  = { "/bin/bash", "-c", "ls -l /app; env" },
        Image    = "ubuntu:12.04",
        Env      = {
          "PORT=8080",
          "__VAR_TEST=foobar",
        },
        Volumes  = {
          ['/app'] = { },
        },
        WorkingDir = "/app",
        Binds = { ("%s:/app"):format(project) },
        Name  = "test-luker",
      }
    }

    it("should support create and run containers", function()
      local output = shell.capture_io(function()
        return luker.run_container(options)
      end)

      assert.is_true(output.result)
      assert.is.match(output.stdout, "%-.*azkfile.json")
      assert.is.match(output.stdout, "drwx.*bin")
      assert.is.match(output.stdout, "PORT=8080")
      assert.is.match(output.stdout, "__VAR_TEST=foobar")
    end)
  end)
end)
