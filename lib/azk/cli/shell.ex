defmodule Azk.Shell do
  defdelegate cmd(command, func), to: Mix.Shell
end
