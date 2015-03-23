import { defer, Q, fs } from 'azk';

export class Pid {
  constructor(file) {
    this.file  = file;
    this.__pid = null;

    if (fs.existsSync(file)) {
      this.pid = parseInt(fs.readFileSync(file).toString());
    }
  }

  get pid() {
    return this.__pid;
  }

  set pid(value) {
    this.__pid = value;
  }

  get running() {
    if (this.pid) {
      try {
        process.kill(this.pid, 0);
        return true;
      } catch (_) { }
    }
    return false;
  }

  update(pid = null) {
    this.pid = pid || this.pid;
    if (this.running) {
      fs.writeFileSync(this.file, this.pid);
    } else {
      this.unlink();
    }
  }

  unlink() {
    if (fs.existsSync(this.file)) {
      fs.unlinkSync(this.file);
      this.pid = null;
    }
  }

  killAndWait() {
    return defer((resolve, reject) => {
      if (this.running) {
        this.kill();
        var interval     = 100;
        var retries      = (3 * 60 * 1000) / interval;
        var long_polling = setInterval(() => {
          if (retries-- && this.running) { return; }
          if (this.running) { return reject(); }

          clearInterval(long_polling);
          resolve(true);
        }, interval);
      } else {
        resolve(true);
      }
    });
  }

  kill() {
    if (this.running) {
      process.kill(this.pid, 'SIGTERM');
    }
    return Q();
  }

  term() {
    this.kill();
    this.pid = null;
    this.update();
  }
}
