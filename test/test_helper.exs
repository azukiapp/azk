ExUnit.start

defmodule Azk.TestCase do
  use ExUnit.CaseTemplate
  import ExUnit.CaptureIO

  using _ do
    quote do
      import ExUnit.CaptureIO
      import unquote(__MODULE__)
    end
  end

  # Get path to bin/azk
  def bin_azk do
    azk = Path.join([__DIR__, "..", "bin", "azk"])
    Path.expand(azk)
  end

  @fixture_path Path.expand(Path.join([__DIR__], "fixtures"))
  def fixture_path(name) do
    path = Path.join([@fixture_path, "#{name}"])
    unless File.dir?(path), do: raise "Fixture #{name} not exist"
    path
  end

  def tmp_path(name) do
    name = List.wrap(name)
    path = Path.expand(Path.join([__DIR__, "..", "tmp"] ++ name))
    unless File.dir?(path), do: File.mkdir_p!(path)
    path
  end

  # TODO: Refactory to use one port
  @ps_out %r/^(?<output>.*)\nresult:\s(?<result>\d*)$/gs
  def run_azk(params // [])

  def run_azk(params) when is_bitstring(params) do
    run_azk([params])
  end

  def run_azk(params) do
    output = capture_io(run_fn(params))
    output = Regex.named_captures(@ps_out, output)
    {result, _} = String.to_integer(output[:result])
    {result, output[:output]}
  end

  defp run_fn(params) do
    fn ->
      cmd = bin_azk <> " " <> Enum.join(params, " ")
      status = Azk.Shell.cmd(cmd, fn data ->
        IO.write(data)
      end)
      IO.write("\nresult: #{status}")
    end
  end

  # Helper to inspect values
  def pp(value), do: IO.inspect(value)
end
