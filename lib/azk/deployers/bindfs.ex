defmodule Azk.Deployers.Bindfs do
  use Azk.Deployer

  def sync!(origin, destiny) do
    unless sync?(origin, destiny) do
      File.mkdir_p!(destiny)
      0 = exec("bindfs #{origin} #{destiny}")
    end
    :ok
  rescue
    MatchError ->
      raise DeployerError.new(origin_path: origin, destiny_path: destiny)
  end

  def unsync!(origin, destiny) do
    if sync?(origin, destiny), do:
      0 = exec("umount #{destiny}")
    :ok
  end

  # TODO: Azkfile should use?
  def sync?(origin, destiny) do
    ori_file = Path.join([origin, Azk.azkfile])
    des_file = Path.join([destiny, Azk.azkfile])
    0 == exec("diff #{ori_file} #{des_file}")
  end

  defp exec(cmd) do
    Azk.Shell.cmd(cmd, fn _ -> end)
  end
end
