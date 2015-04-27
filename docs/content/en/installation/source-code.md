# Source code

## Requirements

Depending on your OS you'll need to follow a few steps before installing `azk`. Follow them here for [Mac](mac_os_x.html), or here for [Linux](linux.html), but feel free to skip the last step of installation that uses one of the package managers.

## Getting the azk source code

Open the terminal and type:

```bash
$ git clone https://github.com/azukiapp/azk.git
$ cd azk
$ make
```

When `make` is done building azk's binary, add the following to your shell configuration file (~/.bashrc, ~/.zshrc):

```bash
# azk source and azk brew
if [ -d "$HOME/your/path/to/azk/bin" ]; then
  alias azksrc="$HOME/your/path/to/azk/bin/azk"
fi
```

Make sure to change `"$HOME/your/path/to/azk/bin"` to the directory that you cloned `azk`. The snippet above will first check if you have the `azk` binary in the directory path, and then create an alias called `azksrc` that you can use anywhere in your terminal.
