defmodule Azk.Cli do

  # TODO: parse azkfile.json and save data
  def start(project_path) do
    Azk.start([project: project_path])
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

  def project do
    Azk.Cli.Server.call(:project)
  end

  defp proceed(args) do
    IO.inspect({:proceed, project, args})
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
