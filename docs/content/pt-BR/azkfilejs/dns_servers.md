## dns_servers

Dá a possibilidade de personalizar os servidores de **DNS** que serão utilizados pelo sistema.

##### Exemplo:

Para o sistema utilizar servidores do [openDNS](https://www.opendns.com/home-internet-security/opendns-ip-addresses/):

```javascript
systems({
  'web': {
    // ...
    dns_servers: ['208.67.222.222', '208.67.222.220']
  },
});
```
