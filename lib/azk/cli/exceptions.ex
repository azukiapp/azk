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

defexception Azk.Cli.NoAzkfileError, app_folder: nil, azk_error: true do
  def message(exception) do
    "Could not find a #{Azk.azkfile} in this application folder: #{app_folder(exception)}"
  end
end

defexception Azk.Cli.Error, azk_error: true, message: nil
