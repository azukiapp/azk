# Azk

Is a tool to developers it assists in creation, maintenance and isolation
of the environments of development. Through the installation of some components
(cli and agent), you will be able easily to create isolated environments to many
projects and stack of languages.

**Features** : provision, monitoring, builtin load balancer, automatic startup script, logging...

## Usage/Features

```bash
$ azk init [project] [--box "azukiapp/ruby#0.1.0"] # Create a Azkfile.json

# Run a specific command
$ azk exec /bin/bash                # Run bash in box
$ azk exec gem install rails        # Install rails gem in box

# Run a background services (Azkfile.json#service)
$ azk service start -n 5            # Start 5 instances of default service
$ azk service worker start -n 5     # Start 5 instances of woker service
$ azk service worker scale -n 10    # Scale to 10 instances of woker service
$ azk service stop azk_id           # Stop specific service process id
$ azk service stop                  # Stop all default service processes
$ azk service restart azk_id        # Restart specific process
$ azk service restart all           # Hard Restart all default service proccesses
$ azk service redis restart         # Restart redis service
$ azk logs                          # Display all processes logs in streaming
$ azk ps                            # Display all processes status
$ azk monit                         # Monitor all processes
$ azk web                           # Health computer API endpoint (http://[project].dev.azk.io)
```

## Development Use

1. install node (>= 0.7.0)
    * We recommend to use **nodenv** and **node-build** tools, search at github.
2. clone this repo
    * `$ git clone https://github.com/azukiapp/azk.git` and `$ cd azk`
3. check tests
    * `$ npm test`
4. `$ ./bin/azk help`

5. if you want to install

```sh
$ npm pack
> azk-<VERSION>.tgz
$ npm install azk-<VERSION>.tgz -g
```

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013 Azuki Serviços de Internet LTDA.

Azk source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.

