# Expandable Properties

We can use some properties inside _strings_ in `Azkfile.js`. These special properties are replaced with runtime values.

## Summary:

1. [General Expandable Properties](#generalexpandableproperties)
  1. [#{system.name}](#systemname)
  1. [#{manifest.dir}](#manifestdir)
  1. [#{manifest.path}](#manifestpath)
  1. [#{azk.version}](#azkversion)
  1. [#{azk.default_domain}](#azkdefault_domain)
  1. [#{azk.default_dns}](#azkdefault_dns)
  1. [#{env}](#env)
1. [Exportable Expandable Properties](#exportableexpandableproperties)
  1. [#{net.host}](#nethost)
  1. [#{net.port}](#netport)
  1. [#{envs}](#envs)
1. [Load Balancer Expandable Properties](#loadbalancerexpandableproperties)
  1. [#{azk.balancer_ip}](#azkbalancer_ip)
  1. [#{azk.balancer_port}](#azkbalancer_port)

## General Expandable Properties:

##### `#{system.name}`

Current system name.

_Example_:

```js
systems: {
  sys1: {
    envs: {
      SYSTEM_NAME: '#{system.name}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
SYSTEM_NAME=sys1
```

--------------------

##### `#{manifest.dir}`

Current folder name where `Azkfile.js` is.

_Example_:

Here we set `workdir` as `/azk/test` and current folder name is `test`.

```js
systems({
  sys1: {
    ...
    workdir: '/azk/#{manifest.dir}',
  }
});
```

```sh
$ azk shell
/home/projects/test

$ azk shell -c 'pwd'
/azk/test
```

--------------------

##### `#{manifest.path}`

Current fullpath where `Azkfile.js` is.

_Example_:

```js
systems: {
  sys1: {
    envs: {
      HOST_MANIFEST_FULL_PATH: '#{manifest.path}',
    }
  }
}
```

```sh
$ pwd
/home/projects/test

$ azk shell -c 'env'
HOST_MANIFEST_FULL_PATH=/home/projects/test
```

--------------------

##### `#{azk.version}`

Current `azk` version.

_Example_:

```js
systems: {
  sys1: {
    envs: {
      AZK_VERSION: '#{azk.version}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
AZK_VERSION=0.16.3
```

--------------------

##### `#{azk.default_domain}`

Part of `azk's` URI

_Example_:

This is most common use of `#{azk.default_domain}` concatenated with the system name.

```js
systems: {
  sys1: {
    http: {
      domains: [ '#{system.name}.#{azk.default_domain}' ],
    },
  }
}
```

```sh
$ azk status --text
 System  Instances  Hostname/url     Instances-Ports  Provisioned
 sys1    0          sys1.dev.azk.io  -                -
```

--------------------

##### `#{azk.default_dns}`

List of DNS on following the order:
- `azk` DNS
- `/etc/resolv.conf` DNS

_Example_:

```js
systems: {
  sys1: {
    envs: {
      ALL_DNS: '#{azk.default_dns}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
ALL_DNS=172.17.0.1,8.8.8.8,8.8.4.4
```

--------------------

##### `#{env}`

Exposes an object with environment variables. Use with dot notation:

_Example_:

```js
systems: {
  sys1: {
    envs: {
      AZK_ENV: '#{env.AZK_ENV}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
AZK_ENV=development
```

--------------------

## Exportable Expandable Properties

`net.host`, `net.port` and `envs` expandable properties can only be used on the `Azkfile.js` `export_envs` section. These properties are only available after system is running.

##### `#{net.host}`

Current system host name. Usually is `azk.dev.io` while `http.domain` is unset.

--------------------

##### `#{net.port}`

Named port exported to dependent system. We have to tell port name. See the property `#{net.port.data}` bellow.

--------------------

##### `#{envs}`

Environment variables to be exported. Can use calculated runtime values.

> Do not confuse with `#{env}`.

--------------------

_Example_:

`/tmp/project/Azkfile.js`

```js
systems: {
  main_system: {
    depends: ['mysql']
  }
  mysql: {
    image: { docker: 'azukiapp/mysql:5.6' },
    ports: {
      // named port: data
      data: '3306/tcp',
    },
    envs: {
      // environment variables
      // to sensitive data use `.env` file
      MYSQL_USER: 'azk',
      MYSQL_PASS: 'azk',
      MYSQL_DATABASE: '#{manifest.dir}_development',
    },
    export_envs: {
      // Exporting DATABASE_URL.
      // Using `envs`, not `env`.
      // more info: https://gist.github.com/gullitmiranda/62082f2e47c364ef9617
      DATABASE_URL: 'mysql2://#{envs.MYSQL_USER}:#{envs.MYSQL_PASS}@#{net.host}:#{net.port.data}/#{envs.MYSQL_DATABASE}',
    }
  },
}
```

```sh
$ azk shell main_system -c 'env'
MYSQL_USER: 'azk'
MYSQL_PASS: 'azk'
MYSQL_DATABASE: 'project_development'
DATABASE_URL=mysql2://azk:azk@dev.azk.io:32772/project_development
```

--------------------

## Load Balancer Expandable Properties

> For expandable properties below there are no guarantees. Use with caution.

##### `#{azk.balancer_ip}`

Load Balancer IP

##### `#{azk.balancer_port}`

Load Balancer Port

_Example_:

```js
systems: {
  sys1: {
    envs: {
      BALANCER_IP:   '#{azk.balancer_ip}',
      BALANCER_PORT: '#{azk.balancer_port}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
BALANCER_IP=172.17.0.1
BALANCER_PORT=80
```
