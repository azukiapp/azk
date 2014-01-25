local h         = require('spec.spec_helper')
local azk       = require('azk')
local app       = require('azk.app')
local shell     = require('azk.cli.shell')
local fs        = require('azk.utils.fs')
local box       = require('azk.box')
local provision = require('azk.box.provision')
local i18n      = require('azk.i18n')
local luker     = require('luker')

local tablex    = require('pl.tablex')
local stringx   = require('pl.stringx')
local path      = require('pl.path')

describe("Azk box #provision", function()
  local images = nil
  local i18n_f = i18n.module("provision")

  after_each(function()
    h.remove_test_images()
  end)

  local function mock_git_clone(origin)
    local old_execute = os.execute
    local git = path.join(azk.root_path, "libexec", "azk-git")
    os.execute = function(cmd)
      if cmd:match("^" .. h.er(git) .. " .*") then
        local cmd = stringx.split(cmd)
        fs.cp_r(origin, cmd[3])
        return true
      end
      return old_execute(cmd)
    end
  end

  it("should provision a docker image", function()
    local box_data = box.parse("azk:test-box-provision")
    local result = shell.capture_io(function()
      os.execute = function(cmd)
        shell.info(cmd)
        return true
      end
      return provision(box_data)
    end)

    local image = { image = box_data.image }
    assert.has_log("info", i18n_f("check", image), result.stderr)
    assert.has_log("info", i18n_f("detected", { ['type'] = 'docker' }), result.stderr)
    assert.has_log("info", i18n_f("searching", image), result.stderr)
    assert.has_log("info", i18n_f("not_found", image), result.stderr)
    assert.has_log("info", i18n_f("making", image), result.stderr)
    assert.has_log("info", i18n_f("provisioned", image), result.stderr)
    assert.is.match(result.stderr, h.er("docker pull " .. box_data.image))
  end)

  it("should provision a local repository", function()
    local box_data = box.parse(h.fixture_path("test-box"))
    local result   = shell.capture_io(function()
      return provision(box_data)
    end)

    local image = { image = box_data.image }
    assert.has_log("info", i18n_f("check", image), result.stderr)
    assert.has_log("info", i18n_f("detected", { ['type'] = 'path' }), result.stderr)
    assert.has_log("info", i18n_f("searching", image), result.stderr)
    assert.has_log("info", i18n_f("not_found", image), result.stderr)
    assert.has_log("info", i18n_f("making", image), result.stderr)
    assert.has_log("info",
      i18n_f("dependence.searching", { image = "ubuntu:12.04" }),
      result.stderr
    )
    assert.is.match(result.stdout, h.er("Step 1 : FROM ubuntu:12.04"))
    assert.is.match(result.stdout, h.er("Step 2 : RUN echo '# step1' $'\\n'"))
    assert.is.match(result.stdout, h.er("Successfully built"))
    assert.is.match(result.stdout, h.er("Removing intermediate container"))
    assert.has_log("info", i18n_f("provisioned", image), result.stderr)

    local result, status = luker.image({ image = box_data.image })
    assert.is.equal(200, status)
    assert.is.match(result.container_config.Cmd[3], h.er(box_data.image))
  end)

  it("should get and provision github repository", function()
    local box_data = box.parse("azukiapp/test-box#stable")
    local result = shell.capture_io(function()
      mock_git_clone(h.fixture_path('test-box'))
      return provision(box_data)
    end)

    local image = { image = box_data.image }
    assert.has_log("info", i18n_f("check", image), result.stderr)
    assert.has_log("info", i18n_f("detected", { ['type'] = 'github' }), result.stderr)
    assert.has_log("info", i18n_f("searching", image), result.stderr)
    assert.has_log("info", i18n_f("not_found", image), result.stderr)
    assert.has_log("info", i18n_f("making", image), result.stderr)
    assert.has_log("info",
      i18n_f("dependence.searching", { image = "ubuntu:12.04" }),
      result.stderr
    )
    assert.is.match(result.stdout, h.er("Step 1 : FROM ubuntu:12.04"))
    assert.is.match(result.stdout, h.er("Step 2 : RUN echo '# step1' $'\\n'"))
    assert.is.match(result.stdout, h.er("Successfully built"))
    assert.is.match(result.stdout, h.er("Removing intermediate container"))
    assert.has_log("info", i18n_f("provisioned", image), result.stderr)


    local result, status = luker.image({ image = box_data.image })
    assert.is.equal(200, status)
    assert.is.match(result.container_config.Cmd[3], h.er(box_data.image))
  end)

  it("should not provision if image exist", function()
    local box_data = box.parse(h.fixture_path("test-box"))

    -- Initial provision
    shell.capture_io(function()
      return provision(box_data)
    end)

    -- Reprovision
    local result = shell.capture_io(function()
      return provision(box_data)
    end)

    local _, status = luker.image({ image = box_data.image })
    assert.is.equal(true, result.result)
    assert.is.equal(200, status)
    assert.is_not.match(result.stdout, h.er("Step 1 : FROM ubuntu:12.04"))

    local image = { image = box_data.image }
    assert.has_log("info", i18n_f("check", image), result.stderr)
    assert.has_log("info", i18n_f("detected", { ['type'] = 'path' }), result.stderr)
    assert.has_log("info", i18n_f("searching", image), result.stderr)
    assert.has_log("info", i18n_f("already", image), result.stderr)
  end)

  it("should reprovision if force options", function()
    local box_data = box.parse(h.fixture_path("test-box"))

    -- Initial provision
    shell.capture_io(function()
      return provision(box_data)
    end)

    -- Force reprovision
    local result = shell.capture_io(function()
      return provision(box_data, { force = true })
    end)

    local image = { image = box_data.image }
    assert.has_log("info", i18n_f("check", image), result.stderr)
    assert.has_log("info", i18n_f("detected", { ['type'] = 'path' }), result.stderr)
    assert.has_log("info", i18n_f("searching", image), result.stderr)
    assert.has_log("info", i18n_f("already", image), result.stderr)
    assert.has_log("info", i18n_f("making", image), result.stderr)
    assert.has_log("info",
      i18n_f("dependence.searching", { image = "ubuntu:12.04" }),
      result.stderr
    )
    assert.is.match(result.stdout, h.er("Step 1 : FROM ubuntu:12.04"))
    assert.is.match(result.stdout, h.er("Step 2 : RUN echo '# step1' $'\\n'"))
    assert.is.match(result.stdout, h.er("Successfully built"))
    assert.is.match(result.stdout, h.er("Removing intermediate container"))
    assert.has_log("info", i18n_f("provisioned", image), result.stderr)

    local result, status = luker.image({ image = box_data.image })
    assert.is.equal(200, status)
    assert.is.match(result.container_config.Cmd[3], h.er(box_data.image))
  end)

  it("should return a error if dependece imagem is not satisfied", function()
    local box_data = box.parse(h.fixture_path("test-box"))

    local result = shell.capture_io(function()
      luker.image = function(options)
        return false, 404
      end
      return provision(box_data)
    end)

    assert.is_false(result.result)

    local image = { image = box_data.image }
    local dependence = { image = "ubuntu:12.04" }
    assert.has_log("info", i18n_f("check", image), result.stderr)
    assert.has_log("info", i18n_f("detected", { ['type'] = 'path' }), result.stderr)
    assert.has_log("info", i18n_f("searching", image), result.stderr)
    assert.has_log("info", i18n_f("not_found", image), result.stderr)
    assert.has_log("info", i18n_f("dependence.searching", dependence), result.stderr)
    assert.has_log("error", i18n_f("dependence.not_found", dependence), result.stderr)
  end)

  it("should recursive provision if dependence is forced", function()
    local box_data = box.parse(h.fixture_path("test-box"))

    local result = shell.capture_io(function()
      local execute = os.execute
      os.execute = function(cmd)
        shell.info(cmd)
        return execute(cmd)
      end
      luker.image = function(options)
        return false, 404
      end
      return provision(box_data, { loop = true })
    end)

    assert.is_true(result.result)

    local image = { image = box_data.image }
    local dependence = { image = "ubuntu:12.04" }
    assert.has_log("info", i18n_f("check", image), result.stderr)
    assert.has_log("info", i18n_f("detected", { ['type'] = 'path' }), result.stderr)
    assert.has_log("info", i18n_f("searching", image), result.stderr)
    assert.has_log("info", i18n_f("not_found", image), result.stderr)
    assert.has_log("info", i18n_f("dependence.searching", dependence), result.stderr)
    assert.has_log("info", i18n_f("dependence.not_found_it", dependence), result.stderr)

    assert.has_log("info", i18n_f("check", dependence), result.stderr)
    assert.has_log("info", i18n_f("detected", { ['type'] = 'docker' }), result.stderr)
    assert.has_log("info", i18n_f("searching", dependence), result.stderr)
    assert.has_log("info", i18n_f("not_found", dependence), result.stderr)
    assert.has_log("info", i18n_f("making", dependence), result.stderr)
    assert.has_log("info", i18n_f("provisioned", image), result.stderr)

    assert.is.match(result.stderr, h.er("docker pull " .. dependence.image))

    local result, status = luker.image(image)
    assert.is.equal(200, status)
    assert.is.match(result.container_config.Cmd[3], h.er(box_data.image))
  end)
end)
