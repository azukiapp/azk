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
      status = Mix.Shell.cmd(cmd, fn data ->
        IO.write(data)
      end)
      IO.write("\nresult: #{status}")
    end
  end

  # Helper to inspect values
  def pp(value), do: IO.inspect(value)
end
