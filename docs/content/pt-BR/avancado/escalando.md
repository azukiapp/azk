# Escalando

Quando o arquivo `Azkfile.js` foi criado, por padrão o sistemas `azkdemo` foi configurado para rodar em duas instâncias. Isso pode ser verificado pela opção `scalable`:

```js
systems({
  azkdemo: {
    // ...
    scalable: {"default": 2},
    http: {
      // azkdemo.azk.dev
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    // ...
  },
});
```

Além da definição do número de instâncias, também foi adicionado a opção `http`, esta opção configura um balanceador de carga que distribui as requisições feitas a [http://azkdemo.azk.dev](http://azkdemo.azk.dev) entre as instâncias.

