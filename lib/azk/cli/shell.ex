defmodule Azk.Shell do
  # TODO: Improvement to return the output and return code
  defdelegate cmd(command, func), to: Mix.Shell
end
