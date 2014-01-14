local os    = require('os')
local ssh   = require('azk.agent.ssh')
local shell = require('azk.cli.shell')

local helper = require('spec.spec_helper')

describe("Azk agent ssh client", function()
  setup(function()
    stub(os, "execute")
  end)

  before_each(function()
    os.execute.calls = {}
  end)

  teardown(function()
    os.execute:revert()
  end)

  it("should execute ssh with specific parameters", function()
    ssh.run("azk-agent")
    local cmd = os.execute.calls[1][1]

    assert.spy(os.execute).was.called()
    assert.is.match(cmd, '^/usr/bin/env ssh')
    assert.is.match(cmd, '%-i /.*/insecure_private_key')
    assert.is.match(cmd, helper.escape_regexp('core@azk-agent'))
    assert.is.match(cmd, helper.escape_regexp('-o DSAAuthentication=yes'))
    assert.is.match(cmd, helper.escape_regexp('-o StrictHostKeyChecking=no'))
    assert.is.match(cmd, helper.escape_regexp('-o UserKnownHostsFile=/dev/null'))
    assert.is.match(cmd, helper.escape_regexp('-o LogLevel=FATAL'))
    assert.is.match(cmd, helper.escape_regexp('-o IdentitiesOnly=yes'))
  end)

  it("should support execute a command", function()
    ssh.run("azk-agent", "ls", "-l")
    local cmd = os.execute.calls[1][1]

    assert.spy(os.execute).was.called()
    assert.is.match(cmd, "'ls %-l'$")
  end)

  it("should support interactive mode", function()
    ssh.run("azk-agent", "-t", "ls", "-l")
    local cmd = os.execute.calls[1][1]

    assert.spy(os.execute).was.called()
    assert.is.match(cmd, "%-t 'ls %-l'$")
  end)
end)
