## http

Define qual a URI que será exportada.

#### Uso:

```js
http: {
  domains: [ 'URI' ],
},
```

##### Exemplos:

Caso o projeto esteja na pasta `/home/projetos/azukidemo/` será disponibilizado o endereço http://azukidemo-sys1.dev.azk.io/

```js
sys1:{
  http: {
    domains: [ "#{manifest.dir}-#{system.name}.#{azk.default_domain}" ],
  },
}
```
