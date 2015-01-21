## azk logs

Displays system _logs_. 

#### Options:

- `--follow, --tail, -f`  Displays logs in real time (default: false)
- `--lines, -n`           Displays the last `n` log lines
- `--timestamps`          Displays date and time for each log line (default: true)

#### Usage:

    $ azk [options] logs [options] [system] [instances]

#### Example:

```
$ azk logs

node0101 2014-12-22T17:17:15.335085996Z
node0101 2014-12-22T17:17:15.335085996Z > application-name@0.0.1 start /azk/azkfile-init-examples/node010
node0101 2014-12-22T17:17:15.335085996Z > node app.js
node0101 2014-12-22T17:17:15.335085996Z
node0101 2014-12-22T17:17:15.440927493Z Express server listening on port 5000
```
