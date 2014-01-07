local utils = require('azk.utils')
local path  = require('azk.utils.path')

local os = require('os')

describe("Azk utils", function()
  local old_tmpdir = utils.getenv("TMPDIR")

  teardown(function()
    utils.setenv("TMPDIR", old_tmpdir)
  end)

  before_each(function()
    utils.setenv("ENV_TO_TEST", "test")
  end)

  it("should return a current file and directory", function()
    local azk_path  = require('os').getenv("AZK_PATH")

    assert.are.equal(utils.__FILE__(),
      path.join(azk_path, "spec", "azk", "utils_spec.lua")
    )

    assert.are.equal(utils.__DIR__(),
      path.join(azk_path, "spec", "azk")
    )
  end)

  it("should return a unique id", function()
    local id = utils.unique_id()
    assert.are.equal(32, #id)
    assert.match(id, "^[%a|%d]*$")
    assert.are_not.equal(id, utils.unique_id())
  end)

  it("should return a env variable", function()
    local value = utils.getenv("ENV_TO_TEST")
    assert.is.equal(os.getenv("ENV_TO_TEST"), value)
  end)

  it("should return nil for unset evn variable", function()
    assert.is.blank(utils.getenv("__NOT_EXISTS_AZK_ENV__"))
  end)

  it("should allow the overlap of an env variable", function()
    local value = os.getenv("ENV_TO_TEST")

    utils.setenv("ENV_TO_TEST", "/")
    assert.is_not.equal(value, "/")
    assert.is.equal(os.getenv("ENV_TO_TEST"), "/")
  end)

  it("should unset env varible", function()
    utils.setenv("ENV_TO_TEST")
    assert.is.blank(os.getenv("ENV_TO_TEST"))
  end)

  it("should return a temporary directory", function()
    utils.setenv("TMPDIR", "/tmpdir")
    assert.is.equal(utils.tmp_dir(), utils.getenv("TMPDIR"))

    utils.unset("TMPDIR")
    utils.setenv("TEMP", "/temp")
    assert.is.equal("/temp", utils.tmp_dir())

    utils.unset("TEMP")
    utils.setenv("TMP", "/tmp")
    assert.is.equal("/tmp", utils.tmp_dir())

    utils.unset("TMP")
    assert.is.equal(path.join(path.rootvolume, "tmp"), utils.tmp_dir())
  end)
end)
