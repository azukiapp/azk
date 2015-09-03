## docker_extra

> __Important__: This option is available here for reference only. It shall be avoided no matter what and its support can cease to exist with no previous warning or backward compatibility.

It allows customizing the options sent to [Docker Remote API][docker_remote_api] at the creation time of a container. All options listed [here][docker_remote_api_create] are supported.

You should be warned that some options can conflict with those used by `azk` itself, such as:

* `Name`
* `Image`
* `Cmd`
* `AttachStdin`
* `AttachStdout`
* `AttachStderr`
* `Tty`
* `OpenStdin`
* `ExposedPorts`
* `Env`
* `WorkingDir`
* `HostConfig.Binds`
* `HostConfig.PortBindings`
* `HostConfig.Dns`

However, as every "backdoor" option, can be other cases not listed above. Use with caution :)

##### Example:

Restricting the amount of memory used by the `web` system containers:

```javascript
systems({
  'web': {
    // ...
    docker_extra: {
      HostConfig: { Memory: 120 },
    },
  },
});
```

!INCLUDE "../../../links.md"
