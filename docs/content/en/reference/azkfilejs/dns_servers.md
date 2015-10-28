## dns_servers

Gives the possibility to customize the DNS servers that will be used by the system.

##### Example:

For the system to use the [openDNS][openDNS] servers:

```javascript
systems({
  'web': {
    // ...
    dns_servers: ['208.67.222.222', '208.67.222.220']
  },
});
```

!INCLUDE "../../../links.md"
