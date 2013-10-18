defmodule Azk.Cli.Commands.Exec do
  use Azk.Cli.Command

  def run(_azkfile, argv // System.argv) do
    IO.inspect(argv)
  end
end

