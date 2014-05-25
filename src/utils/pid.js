import { fs, path, defer } from 'azk';

export class Pid {
  constructor(file) {
    this.file = file;
    this.pid  = null;

    if (fs.existsSync(file)) {
      this.pid = parseInt(fs.readFileSync(file).toString());
    }
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

  term() {
    if (this.running) {
      process.kill(this.pid, 'SIGTERM');
    }
    this.pid = null;
    this.update();
  }
}
