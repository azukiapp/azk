defmodule Azk.Utils.JSON do
  def decode(data, opts // []) do
    :jsx.decode(data, opts)
  end

  def encode(data, opts // []) do
    opts = Keyword.merge(opts, [
      pre_encode: &pre_encode/1
    ])
    :jsx.encode(data, opts)
  end

  def is_json(data, opts // []) do
    :jsx.is_json(data, opts)
  end

  defp pre_encode(value) when is_record(value, HashDict) do
    value.to_list
  end

  defp pre_encode(nil), do: :null
  defp pre_encode(value), do: value
end

