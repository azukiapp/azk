defmodule Azk.Deployers.Bindfs.Test do
  use Azk.TestCase, async: false
  alias Azk.Deployers.Bindfs

  setup do
    unmount(destiny = tmp_path([:apps, "app"]))
    {:ok,
      origin: fixture_path(:full_azkfile),
      destiny: destiny
    }
  end

  teardown var do
    unmount(var[:destiny])
    :ok
  end

  test "call the sync! to bind folders", var do
    {origin, destiny} = {var[:origin], var[:destiny]}
    refute equal_dir?(origin, destiny)
    assert :ok == Bindfs.sync!(origin, destiny)
    assert equal_dir?(origin, destiny)
  end

  test "create a destiny folder before sync", var do
    {origin, destiny} = {var[:origin], var[:destiny]}
    File.rm_rf!(destiny)
    assert :ok == Bindfs.sync!(origin, destiny)
    assert equal_dir?(origin, destiny)
  end

  test "call the sync? to check bind folders", var do
    {origin, destiny} = {var[:origin], var[:destiny]}
    assert :ok == Bindfs.sync!(origin, destiny)
    assert Bindfs.sync?(origin, destiny)
    assert equal_dir?(origin, destiny)
    unmount(destiny)
    refute Bindfs.sync?(origin, destiny)
  end

  test "call the unsync! to unmount folders bindeds", var do
    {origin, destiny} = {var[:origin], var[:destiny]}
    assert :ok == Bindfs.sync!(origin, destiny)
    assert Bindfs.sync?(origin, destiny)
    assert :ok == Bindfs.unsync!(origin, destiny)
    refute equal_dir?(origin, destiny)
  end

  def equal_dir?(origin, destiny) do
    0 == Azk.Shell.cmd("diff #{origin} #{destiny}", &(&1))
  end

  def unmount(destiny) do
    Azk.Shell.cmd("umount #{destiny}", fn _ -> end)
  end
end
