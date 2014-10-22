import { Q, fs, path, defer } from 'azk';

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
