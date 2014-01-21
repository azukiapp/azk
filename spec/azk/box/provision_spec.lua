local helper    = require('spec.spec_helper')
local azk       = require('azk')
local app       = require('azk.app')
local shell     = require('azk.cli.shell')
local fs        = require('azk.utils.fs')
local box       = require('azk.box')
local provision = require('azk.box.provision')
local luker     = require('luker')

local tablex    = require('pl.tablex')
local stringx   = require('pl.stringx')
local path      = require('pl.path')

describe("Azk box #provision", function()
  local images = {}

  after_each(function()
    tablex.foreachi(images, function(image)
      local result, status = luker.image({ image = image })
      if result.id then
        local result, status = luker.remove_image({ image = image })
        assert.is.equal(200, status)
      end
    end)
    images = {}
  end)

  local function mock_git_clone(origin)
    local old_execute = os.execute
    local git = path.join(azk.root_path, "libexec", "azk-git")
    os.execute = function(cmd)
      if cmd:match("^" .. helper.escape_regexp(git) .. " .*") then
        local cmd = stringx.split(cmd)
        fs.cp_r(origin, cmd[3])
        return true
      end
      return old_execute(cmd)
    end
  end

  it("should provision a local repository", function()
    local box_data = box.parse(helper.fixture_path("test-box"))
    images[#images+1] = box_data.full_name
    local result   = shell.capture_io(function()
      return provision(box_data)
    end)

    assert.has_log("info", "[image] searching: " .. box_data.full_name, result.stderr)
    assert.has_log("info", "[image] not found: " .. box_data.full_name, result.stderr)
    assert.has_log("info", "[image] provision it ...", result.stderr)
    assert.is.match(result.stdout, helper.escape_regexp("Step 1 : FROM ubuntu:12.04"))
    assert.is.match(result.stdout, helper.escape_regexp("Step 2 : RUN echo '# step1' $'\\n'"))
    assert.is.match(result.stdout, helper.escape_regexp("Successfully built"))
    assert.is.match(result.stdout, helper.escape_regexp("Removing intermediate container"))
    assert.has_log("info", "[image] provisioned: " .. box_data.full_name, result.stderr)

    local result, status = luker.image({ image = box_data.full_name })
    assert.is.equal(200, status)
    assert.is.match(result.container_config.Cmd[3], helper.escape_regexp(box_data.full_name))
  end)

  it("should get and provision github repository", function()
    local box_data = box.parse("azukiapp/test-box#stable")
    images[#images+1] = box_data.full_name

    local result = shell.capture_io(function()
      mock_git_clone(helper.fixture_path('test-box'))
      return provision(box_data)
    end)

    assert.has_log("info", "[image] searching: " .. box_data.full_name, result.stderr)
    assert.has_log("info", "[image] not found: " .. box_data.full_name, result.stderr)
    assert.has_log("info", "[image] provision it ...", result.stderr)
    assert.is.match(result.stdout, helper.escape_regexp("Step 1 : FROM ubuntu:12.04"))
    assert.is.match(result.stdout, helper.escape_regexp("Step 2 : RUN echo '# step1' $'\\n'"))
    assert.is.match(result.stdout, helper.escape_regexp("Successfully built"))
    assert.is.match(result.stdout, helper.escape_regexp("Removing intermediate container"))
    assert.has_log("info", "[image] provisioned: " .. box_data.full_name, result.stderr)

    local result, status = luker.image({ image = box_data.full_name })
    assert.is.equal(200, status)
    assert.is.match(result.container_config.Cmd[3], helper.escape_regexp(box_data.full_name))
  end)

  it("should not provision if image exist", function()
    local box_data = box.parse(helper.fixture_path("test-box"))
    images[#images+1] = box_data.full_name

    -- Initial provision
    shell.capture_io(function()
      return provision(box_data)
    end)

    -- Reprovision
    local result = shell.capture_io(function()
      return provision(box_data)
    end)

    local _, status = luker.image({ image = box_data.full_name })
    assert.is.equal(true, result.result)
    assert.is.equal(200, status)
    assert.is_not.match(result.stdout, helper.escape_regexp("Step 1 : FROM ubuntu:12.04"))
    assert.has_log("info", "[image] searching: " .. box_data.full_name, result.stderr)
    assert.has_log("info", "[image] already provisioned: " .. box_data.full_name, result.stderr)
  end)

  it("should reprovision if force options", function()
    local box_data = box.parse(helper.fixture_path("test-box"))
    images[#images+1] = box_data.full_name

    -- Initial provision
    shell.capture_io(function()
      return provision(box_data)
    end)

    -- Force reprovision
    local result = shell.capture_io(function()
      return provision(box_data, { force = true })
    end)

    assert.has_log("info", "[image] searching: " .. box_data.full_name, result.stderr)
    assert.has_log("info", "[image] already provisioned: " .. box_data.full_name, result.stderr)
    assert.has_log("info", "[image] provision it ...", result.stderr)
    assert.is.match(result.stdout, helper.escape_regexp("Step 1 : FROM ubuntu:12.04"))
    assert.is.match(result.stdout, helper.escape_regexp("Step 2 : RUN echo '# step1' $'\\n'"))
    assert.is.match(result.stdout, helper.escape_regexp("Successfully built"))
    assert.is.match(result.stdout, helper.escape_regexp("Removing intermediate container"))
    assert.has_log("info", "[image] provisioned: " .. box_data.full_name, result.stderr)

    local result, status = luker.image({ image = box_data.full_name })
    assert.is.equal(200, status)
    assert.is.match(result.container_config.Cmd[3], helper.escape_regexp(box_data.full_name))
  end)
end)
