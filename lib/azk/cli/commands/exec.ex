defmodule Azk.Cli.Command.Exec do
  use Azk.Cli.Command

  def run(argv // System.argv) do
    IO.inspect(argv)
  end
end

