local azk    = require('azk')
local os     = require('os')
local utils  = require('azk.utils')
local fs     = require('azk.utils.fs')
local path   = require('azk.utils.path')
local helper = require('spec.spec_helper')

describe("azk utils file", function()
  local this_file = utils.__FILE__()
  local this_dir  = utils.__DIR__()
  local base_dir  = helper.tmp_dir()

  teardown(function()
    fs.rm_rf(base_dir)
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

    fs.rm_rf(dir_path)
    assert.is_false(fs.is_dir(dir_path))
  end)

  it("should return a current directory", function()
    local current = lfs.currentdir()
    assert.is.equal(current, fs.pwd())

    fs.cd("..")
    assert.is.equal(path.dirname(current), fs.pwd())
  end)

  it("should changing current directory", function()
    local current = lfs.currentdir()
    local result  = fs.cd("..")
    assert.is_true(result)
    assert.is.equal(path.dirname(current), fs.pwd())
    fs.cd(current)

    local result, err = fs.cd("./not_exist")
    assert.is.equal(nil, result)
    assert.is.match(err, "Unable.*./not_exist")
  end)

  it("should restore current directory even with error", function()
    local current = fs.pwd()
    local result, err = pcall(fs.cd, "..", function()
      error("one error")
    end)
    assert.is.equal(current, fs.pwd())
    assert.is.match(err, "one error")
  end)

  it("should temporary current directory changing", function()
    local current = fs.pwd()
    fs.cd("..", function()
      assert.is.equal(path.dirname(current), fs.pwd())
    end)
    assert.is.equal(current, fs.pwd())
  end)

  it("should read a file content", function()
    -- Line to test #345
    local content = fs.read(utils.__FILE__())
    assert.is.match(content, "should read a file content")
    assert.is.match(content, "Line to test #345")
  end)

  it("should raise a erro if file not exist in `read`", function()
    local file = utils.__FILE__() .. "not"
    local _, err = pcall(fs.read,file)
    assert.is.match(err, file .. ": No such file or directory")
  end)

  it("should be copy the file", function()
    local o_file = utils.__FILE__()
    local d_file = path.join(base_dir, "destiny_file")

    local status = fs.cp(o_file, d_file)
    assert.is_true(status)
    assert.is.equal(fs.read(d_file), fs.read(o_file))
  end)

  it("should copy a file without destination name", function()
    local o_file = utils.__FILE__()
    local d_file = path.join(base_dir, path.basename(o_file))

    local status = fs.cp(o_file, base_dir)
    assert.is_true(status)
    assert.is.equal(fs.read(d_file), fs.read(d_file))
  end)

  it("should return a errors for invalids copy operations", function()
    local _, err = fs.cp(utils.__FILE__() .. "_not_exist", "")
    assert.is.match(err, "_not_exist: No such file or directory")

    local _, err = fs.cp(utils.__DIR__(), "")
    assert.is.match(err, utils.__DIR__() .. " is a directory %(not copied%)")

    local _, err = fs.cp(utils.__FILE__(), "/__invalid_dir/")
    assert.is.match(err, "directory /__invalid_dir does not exist")
  end)

  it("should return a error for invalid directory copy", function()
    local _, err = fs.cp_r(utils.__DIR__() .. "_not_exist", "")
    assert.is.match(err, "_not_exist: No such file or directory")

    local _, err = fs.cp_r(utils.__DIR__(), "/__invalid_dir/other")
    assert.is.match(err, "directory /__invalid_dir does not exist")
  end)

  it("should copy a directory recursively", function()
    local origin  = path.join(helper.fixture_path("test-box"))
    local dest    = path.join(base_dir, "dest")

    local status = fs.cp_r(origin, dest)
    assert.is_true(status)
    assert.is_true(fs.is_dir(dest))
    assert.is_true(fs.is_dir(path.join(dest, "scripts")))
    assert.is_true(fs.is_regular(path.join(dest, "azkfile.json")))
    assert.is_true(fs.is_regular(path.join(dest, "scripts", "none")))
  end)

  it("should calculate a sha1sum for file or directory", function()
    local file     = path.join(azk.root_path, "bin", "azk.lua")
    local sha_file = fs.shasum(file)

    assert.is.equal("37961babedc3a281ebba56e8716469388876ff7f64abfdb9b007fd3174bb05e5", sha_file)

    local dir     = helper.fixture_path("test-box")
    local sha_dir = fs.shasum(dir)

    assert.is.equal("a036c37cb960b8c3a488cfc66bae8ec7dd93f53b2500337fff7929de0ce1c548", sha_dir)
  end)

  it("should raise erro in calculate sha1sum", function()
    local _, err = pcall(fs.shasum, utils.__FILE__() .. "_not")
    assert.is.match(err, "_not: No such file or directory")
  end)
end)

