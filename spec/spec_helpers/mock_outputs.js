
export function extend(h) {
  h.mockOutputs = function(func, outputs, extra) {
    var mocks = {};

    func(function() {
      // Clear
      outputs.stdout = '';
      outputs.stderr = '';

      outputs.__proto__.show = function() {
        console.log("Stdout:");
        process.stdout.write(this.stdout);
        console.log("Stderr:");
        process.stdout.write(this.stderr);
      }

      outputs.__proto__.reset = function() {
        mocks.stdout = h.makeMemoryStream();
        mocks.stderr = h.makeMemoryStream();

        mocks.stdout.on('data', function(data) {
          outputs.stdout += data.toString();
        });
        mocks.stderr.on('data', function(data) {
          outputs.stderr += data.toString();
        });
      }

      outputs.reset();

      if (extra)
        extra.call(this);
    });

    return mocks;
  }
}

