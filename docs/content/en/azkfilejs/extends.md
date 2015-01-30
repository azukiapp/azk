## extends

Allows inherit a system including its settings. It is necessary that "parent system" to be valid, i.e., that could be called individually. All properties described on "child system", which has the property `extends`, will override the "parent system".

#### Usage:

```js
extends: 'other_base_system_name',
```

##### Examples:

In this example the `system-ruby-child` inherits all `system-ruby-base` configurations.

```js
'system-ruby-base': {
  image   : { docker: 'azukiapp/ruby:latest' },
  shell   : '/bin/bash',
  wait    : false,
  scalable: false,
},

'system-ruby-child':{
  extends : 'system-ruby-base',
  wait    : { retry: 3 },
  scalable: { default: 2 },
  http    : {
    domains: ["#{system.name}.azk.#{azk.default_domain}"],
  },
}
```

> Note that it we need to set `wait` and `scalable` properties to so that `system-ruby-base` could be a valid system.
