local os     = require('os')
local azk    = require('azk')
local ssh    = require('azk.agent.ssh')
local helper = require('spec.spec_helper')
local shell  = require('azk.cli.shell')

describe("Azk #agent #ssh client", function()
  setup(function()
    mock(os)
  end)

  after_each(function()
    helper.reset_mock(os)
  end)

  teardown(function()
    helper.unmock(os)
  end)

  it("should execute ssh with specific parameters", function()
    ssh.run(azk.agent_ip(), "/bin/true")
    local cmd = os.execute.calls[1][1]

    assert.spy(os.execute).was.called()
    assert.is.match(cmd, '^/usr/bin/ssh')
    assert.is.match(cmd, '%-i /.*/insecure_private_key')
    assert.is.match(cmd, helper.escape_regexp('core@' .. azk.agent_ip()))
    assert.is.match(cmd, helper.escape_regexp('-o DSAAuthentication=yes'))
    assert.is.match(cmd, helper.escape_regexp('-o StrictHostKeyChecking=no'))
    assert.is.match(cmd, helper.escape_regexp('-o UserKnownHostsFile=/dev/null'))
    assert.is.match(cmd, helper.escape_regexp('-o LogLevel=FATAL'))
    assert.is.match(cmd, helper.escape_regexp('-o IdentitiesOnly=yes'))
  end)

  it("should support execute a command", function()
    local result = shell.capture_io(function()
      ssh.run(azk.agent_ip(), "/bin/bash", "-c", "cd /etc; ls -l; $; \\")
      return os.execute.calls[1][1]
    end)

    assert.is.match(result.result,
      helper.escape_regexp('"/bin/bash -c \\"cd /etc; ls -l; \\\\\\$; \\\\\\\\\\""')
    )
  end)

  it("should support interactive mode", function()
    local output = shell.capture_io("uname; exit\n", function()
      ssh.run(azk.agent_ip(), "-t", "/bin/bash")
      return os.execute.calls[1][1]
    end)

    assert.is.match(output.result, '%-t "/bin/bash"$')
    assert.is.match(output.stderr, "Pseudo%-terminal will")
    assert.is.match(output.stdout, "Linux\n")
  end)

  it("should execute and return code", function()
    local _, err, code = ssh.run(azk.agent_ip(), "/bin/false")
    assert.is.equal("exit", err)
    assert.is.equal(1, code)
  end)
end)
