## ports

Defines the ports that will be externalised to the host `dev.azk.io`.

#### Usage:

```js
ports: {
  PORT_NAME: '[FIX_PORT_NUMBER:]PORT_NUMBER/tcp',
},
```

##### Examples:

Export the port 8080 of the container to a random port controlled by azk.

```js
ports: {
  http: "8080",
}
```
_______________
Export the port 25 of the container to port 25 of the host.

```js
ports: {
  smtp: "25:25/tcp",
},
export_envs: {
  MAIL_PORT: "#{net.port.smtp}",
},
```

 > __Important: __ Only use this feature as a last resource since it may cause a port conflict on the host machine.
