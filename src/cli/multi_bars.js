var ProgressBar = require('progress');

// TODO: Implement tests
export class Multibar {
  constructor(stream = process.stderr) {
    this.stream     = stream || process.stderr;
    this.cursor     = 0;
    this.bars       = [];
    this.terminates = 0;
  }

  newBar(schema, options = {}) {
    options.stream = this.stream;
    var bar   = new ProgressBar(schema, options);
    var index = this.bars.length;
    this.bars.push(bar);

    // alloc line
    this.move(index);
    this.stream.write('\n');
    this.cursor ++;

    // replace original
    bar.otick = bar.tick;
    bar.tick  = (...args) => this.tick(index, ...args);
    bar.terminate = (message) => {
      this.terminates++;
      if (message) {
        this.clear(index);
        this.stream.write(message);
      }
      if (this.terminates == this.bars.length) {
        this.terminate();
      }
    }

    return bar;
  }

  clear(index) {
    if (!this.stream.isTTY) return;
    this.move(index);
    this.stream.clearLine();
    this.stream.cursorTo(0);
  }

  terminate() {
    this.clear(this.bars.length);
  }

  move(index) {
    if (!this.stream.isTTY) return;
    this.stream.moveCursor(0, index - this.cursor);
    this.cursor = index;
  }

  tick(index, value, options) {
    var bar = this.bars[index];
    if (bar) {
      this.move(index);
      bar.otick(value, options);
    }
  }
}

