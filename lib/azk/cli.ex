defmodule Azk.Cli do
  def start(_azk_path) do
  end

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

  defp proceed(args) do
    IO.inspect({:proceed, args})
  end

  defp display_banner() do
    IO.puts "Banner #{:uuid.to_string(:uuid.uuid4())}"
    #run_command "help", []
  end

  defp display_version() do
    IO.inspect Mix.project
    IO.puts "Azk #{Mix.project[:version]}"
  end

  # Check for --help or --version in the args
  defp check_for_shortcuts([first_arg|_]) when first_arg in
      ["--help", "-h", "-help"], do: :help

  defp check_for_shortcuts([first_arg|_]) when first_arg in
      ["--version", "-v"], do: :version

  defp check_for_shortcuts(_), do: nil
end
