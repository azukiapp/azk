## http

Defines the URI that will be exported.

#### Usage:

```js
http: {
  domains: [ 'URI' ],
},
```

##### Examples:

If the project is inside the folder `/home/projects/azukidemo/` the address http://azukidemo-sys1.dev.azk.io/ will be available.

```js
sys1:{
  http: {
    domains: [ "#{manifest.dir}-#{system.name}.#{azk.default_domain}" ],
  },
}
```
