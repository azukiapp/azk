## ports

Define as portas que serão externalizadas para o host `dev.azk.io`.

#### Uso:

```js
ports: {
  PORT_NAME: '[FIX_PORT_NUMBER:]PORT_NUMBER/tcp',
},
```

##### Exemplos:

Exporta a porta 8080 do container para uma porta randômica controlada pelo azk.

```js
ports: {
  http: "8080",
}
```
_______________
Exporta a porta 25 do container para a porta 25 do host.

```js
ports: {
  smtp: "25:25/tcp",
},
export_envs: {
  MAIL_PORT: "#{net.port.smtp}",
},
```

> __Importante:__ Só utilize este recurso em último caso pois pode haver conflito de portas na máquina host.
