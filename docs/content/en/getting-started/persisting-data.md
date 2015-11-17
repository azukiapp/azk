# Persisting data

If you [set up a database](database.md), you will see that several _refresh_ on page [http://azkdemo.dev.azk.io](http://azkdemo.dev.azk.io) will increment our access counter. But if you run `azk restart`, as shown below:

```bash
$ azk restart
```

By accessing [http://azkdemo.dev.azk.io](http://azkdemo.dev.azk.io) you will see that the access counter was restarted. This is because the database does not know where to persist information about the counter.

## Persistent volume

To add persistence to the database we need to edit the `Azkfile.js` file, adding the entries `command` and `mounts` to the `redis` system as shown below:

!INCLUDE "../../common/getting-started/persistent_example.md"

With this change, we are instructing `azk` to mount the `/data` folder and point to the same folder within the `azk` structure. Refresh the page a couple times, restart `redis` and you will see that the count now persists between each restart.

> **Note 1:** The other included configuration, the `command: "redis-server --appendonly yes"`, tells `azk` how the redis system starts. The command `--appendonly yes`, as described [here](http://redis.io/topics/persistence), sets redis to persist your data even if it is restarted.

> **Note 2:** Not all of the databases use the same folder `/data` to persist data, it must be configured as needed for each database.
