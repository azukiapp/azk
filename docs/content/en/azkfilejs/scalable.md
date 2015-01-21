## scalable

Defines how many instances of the system should be started.

#### Usage:

```js
scalable: { "default": NUM },
```

##### Examples:

No instances by default, that is, will not be started by the azk start.

```js
scalable: { "default": 0 },
```

_____________
Only one instance

```js
scalable: { "default": 1 },
```

_____________
Four instances by default

```js
scalable: { "default": 4 },
```
