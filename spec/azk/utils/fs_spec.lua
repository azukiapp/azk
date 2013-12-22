local os    = require('os')
local utils = require('azk.utils')
local fs    = require('azk.utils.fs')
local path  = require('azk.utils.path')

describe("azk utils file", function()
  local this_file = utils.__FILE__()
  local this_dir  = utils.__DIR__()
  local base_dir  = helper.tmp_dir()

  teardown(function()
    print(fs.rm_rf(base_dir))
  end)

  it("should return true if path to file or directory exist", function()
    assert.is_true(fs.is_exist(this_file))
    assert.is_false(fs.is_exist(this_file .. ".not"))

    assert.is_true(fs.is_exist(this_dir))
    assert.is_false(fs.is_exist(this_dir .. "not"))
  end)

  it("should check if is a directory to call is_dir", function()
    assert.is_true(fs.is_dir(this_dir))
    assert.is_false(fs.is_dir(this_file))
  end)

  it("should check if is a regular file to call is_regular", function()
    assert.is_true(fs.is_regular(this_file))
    assert.is_false(fs.is_regular(this_dir))
  end)

  it("should make a directory", function()
    local dir_path = path.join(base_dir, "single_nivel")
    assert.is_false(fs.is_dir(dir_path))
    local result, _err = fs.mkdir(dir_path)
    assert.is_true(result)
    assert.is_true(fs.is_dir(dir_path))
  end)

  it("should make a recursive directory", function()
    local dir_path = path.join(base_dir, "multi_nivel", "sub")
    assert.is_false(fs.is_exist(dir_path))

    local result, err = fs.mkdir(dir_path)
    assert.is_false(fs.is_exist(dir_path))
    assert.is.equal(err, "No such file or directory")

    local result, err = fs.mkdir_p(dir_path)
    assert.is_true(result)
    assert.is_true(fs.is_dir(dir_path))
  end)

  it("should touch a file", function()
    local file_path = path.join(base_dir, "regular")
    assert.is_false(fs.is_regular(file_path))

    fs.touch(file_path)
    assert.is_true(fs.is_regular(file_path))

    local atime = fs.stat(file_path).access
    fs.touch(file_path, atime + 2)
    assert.is_true(atime < fs.stat(file_path).access)
  end)

  it("should remove a single file or directory", function()
    local file_path = path.join(base_dir, "test_rm")
    fs.touch(file_path)
    assert.is_true(fs.is_regular(file_path))

    fs.rm(file_path)
    assert.is_false(fs.is_regular(file_path))

    local dir_path  = path.join(base_dir, "test_rm")
    fs.mkdir(dir_path)

    fs.rm(dir_path)
    assert.is_false(fs.is_dir(dir_path))
  end)

  it("should recursively remove a directory #only", function()
    local dir_path = path.join(base_dir, "multi_rm")
    fs.mkdir_p(path.join(dir_path, "sub"))
    fs.touch(path.join(dir_path, "sub", "file"))
    fs.touch(path.join(dir_path, "sub", ".hidefile"))

    print(fs.rm_rf(dir_path))
    assert.is_false(fs.is_dir(dir_path))
  end)
end)
