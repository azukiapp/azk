defexception Azk.Cli.NoCommandError, command: nil, azk_error: true do
  def message(exception) do
    "The command #{command(exception)} could not be found"
  end
end

defexception Azk.Cli.InvalidCommandError, command: nil, azk_error: true do
  def message(exception) do
    "The command #{command(exception)} does not respond to run/1"
  end
end

defexception Azk.Cli.NoAzkfileError, azk_error: true,
  message: "Could not find a #{Azk.azkfile} in this application folder"

defexception Azk.Cli.Error, azk_error: true, message: nil
