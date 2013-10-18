defmodule Azk.Cli do

  def run(args // System.argv) do
    case check_for_shortcuts(args) do
      :help ->
        display_banner()
      :version ->
        display_version()
      nil ->
        proceed(args)
    end
  end

  defp get_command([h|t]) do
    { h, t }
  end

  defp run_command(name, args) do
    try do
      Azk.Cli.Command.run(name, args)
    rescue
      # We only rescue exceptions in the cli namespace, all
      # others pass through and will explode on the users face
      exception ->
        stacktrace = System.stacktrace

        if function_exported?(exception, :azk_error, 0) do
          if msg = exception.message, do: IO.write "** (Azk) #{msg}\n"
          exit(1)
        else
          raise exception, [], stacktrace
        end
    end
  end

  defp proceed(args) do
    { command, args } = get_command(args)
    run_command command, args
  end

  defp display_banner() do
    IO.puts "Banner #{:uuid.to_string(:uuid.uuid4())}"
    #run_command "help", []
  end

  defp display_version() do
    IO.puts "Azk #{Mix.project[:version]}"
  end

  # Check for --help or --version in the args
  defp check_for_shortcuts([first_arg|_]) when first_arg in
      ["--help", "-h", "-help"], do: :help

  defp check_for_shortcuts([first_arg|_]) when first_arg in
      ["--version", "-v"], do: :version

  defp check_for_shortcuts(_), do: nil
end
