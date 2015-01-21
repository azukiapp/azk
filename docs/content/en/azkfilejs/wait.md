## wait

Sets the number and the time between each attempt to connect to the port to be available by the system. If there is no response by the container, a _timeout_ error is triggered.

#### Usage:

```js
wait: { retry: [ATTEMPT_NUM], timeout: [TIME_BETWEEN_ATTEMPTS_IN_MILLISECONDS] },
```

##### Examples:

10 attempts with a 2 second interval between them:

```js
wait: { retry: 10, timeout: 2000 },
```

20 attempts with a 1 second interval between them:

```js
wait: { retry: 20, timeout: 1000 },
```
