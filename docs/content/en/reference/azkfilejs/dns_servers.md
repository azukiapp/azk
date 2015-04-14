## dns_servers

Gives the possibility to customize the DNS servers that will be used by the system.

##### Example:

For the system to use the [openDNS](https://www.opendns.com/home-internet-security/opendns-ip-addresses/) servers:

```javascript
systems({
  'web': {
    // ...
    dns_servers: ['208.67.222.222', '208.67.222.220']
  },
});
```
