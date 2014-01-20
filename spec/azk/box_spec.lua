local fs     = require('azk.utils.fs')
local path   = require('azk.utils.path')
local box    = require('azk.box')
local helper = require('spec.spec_helper')

describe("Azk box", function()
  it("should support github format", function()
    local result = box.parse("azukiapp/ruby-box#stable")

    assert.is.equal("github", result.type)
    assert.is.equal("https://github.com/azukiapp/ruby-box", result.repository)
    assert.is.equal("azukiapp/ruby-box", result.path)
    assert.is.equal("stable", result.version)
    assert.is.equal("azukiapp/ruby-box", result.image)
    assert.is.equal("azukiapp/ruby-box:stable", result.full_name)
  end)

  it("should support github format without version", function()
    local result = box.parse("azukiapp/ruby-box")

    assert.is.equal("github", result.type)
    assert.is.equal("master", result.version)
    assert.is.equal("azukiapp/ruby-box", result.image)
    assert.is.equal("azukiapp/ruby-box:master", result.full_name)
  end)

  it("should support path format", function()
    local box_path = helper.fixture_path("test-box") .. "/"
    local sha      = fs.shasum(box_path)
    local result   = box.parse(box_path)

    box_path = box_path:gsub("/$", ""):gsub("^/", "")

    assert.is.equal("path", result.type)
    assert.is.equal(nil, result.repository)
    assert.is.equal("/" .. box_path, result.path)
    assert.is.equal(sha, result.version)
    assert.is.equal(box_path, result.image)
    assert.is.equal(box_path .. ":" .. sha, result.full_name)
  end)

  it("should return a error if path not found", function()
    local box_path = path.join(fs.pwd(), "novalid")
    local _, err = pcall(box.parse, './novalid')
    local msg = helper.escape_regexp(
      "box directory '" .. box_path .. "' not found"
    )
    assert.is.match(err, msg)
  end)

  it("should expand relative path", function()
    fs.cd(helper.tmp_dir(), function()
      local box_path = "./box"
      fs.mkdir(box_path)

      local result = box.parse(box_path)

      assert.is.equal("path", result.type)
      assert.is.equal(path.join(fs.pwd(), "box"), result.path)
    end)
  end)

  it("should support docker format", function()
    local result = box.parse("ubuntu:12.04")

    assert.is.equal("docker", result.type)
    assert.is.equal(nil, result.repository)
    assert.is.equal(nil, result.path)
    assert.is.equal("12.04", result.version)
    assert.is.equal("ubuntu", result.image)
    assert.is.equal("ubuntu:12.04", result.full_name)
  end)

  it("should return erro for invalid box", function()
    local box_name = '%%#^%@'
    local _, err   = pcall(box.parse, box_name)
    local msg      = "'%s' is not a valid definition of box"

    assert.is.match(err, helper.escape_regexp(msg:format(box_name)))
  end)
end)
