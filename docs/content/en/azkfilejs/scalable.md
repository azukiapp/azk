## scalable

Defines how many instances of the system should be started.

#### Usage:

```js
scalable: { default: NUM, limit: NUM },
```

##### Examples:

* (__default__) One instance by default, and limited only one:

  ```js
  scalable: { default: 1, limit: 1 },
  ```

* No instances by default, that is, will not be started by the `azk start`:

  ```js
  scalable: { default: 0 },
  ```

* Only one instance:

  ```js
  scalable: { default: 1 },
  ```

* Four instances by default:

  ```js
  scalable: { default: 4 },
  ```
