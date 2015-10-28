## wait

Represents total time to wait connection until port be available by the system container.
If there is no response by the container, a _timeout_ error is triggered.

#### Usage:

```js
wait: [MAX_TIMEOUT],
```

##### Deprecation warning

The old way to set `wait` option will now only multiply retry and timeout.

```js
// will be deprecated
wait: { retry: [RETRY_ATTEMPTS], timeout: [TIME_IN_MILLISECONDS] },
```

##### Examples:

Will try to connect for 20 seconds:

```js
wait: 20,
```

Will try to connect for 20 seconds:

```js
// will be deprecated
wait: { retry: 10, timeout: 2000 },
```

Will try to connect for 20 seconds:

```js
// will be deprecated
wait: { retry: 20, timeout: 1000 },
```
