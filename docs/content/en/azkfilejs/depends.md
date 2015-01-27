## depends

Identifies which dependencies are required for the system to be started. When starting the system that has dependencies, systems who it depends on will be started automatically. This is very useful when we have systems that rely on databases, for example.

#### Usage:

```js
depends: ['SYSTEM_NAME_1', 'SYSTEM_NAME_2', /*..., */ 'SYSTEM_NAME_N'],
```

##### Examples:

In this example, `sys1` depends on `sys2` which depends on `sys3`. To start `sys1` this will require that the` sys2` be started first, which in turn, as it depends on `sys3`, will cause azk to start `sys3` first. Only `sys3` can be raised separately.

```js
sys1: {
  depends: ['sys2'],
},
sys2: {
  depends: ['sys3'],
},
sys3: {
  depends: [],
}
```

