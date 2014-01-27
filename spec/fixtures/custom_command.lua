-- Fake command to test
return {
  run = function(func)
    return func()
  end
}
