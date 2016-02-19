# Persistindo dados

Se você [configurou um banco de dados](database.md), verá que vários _refresh_, na página [http://azkdemo.dev.azk.io](http://azkdemo.dev.azk.io), fazem com que nosso contador de acessos seja incrementado. Porém se você executar um `azk restart` no sistema, como demonstrado abaixo:

```bash
$ azk restart
```

Ao acessar [http://azkdemo.dev.azk.io](http://azkdemo.dev.azk.io) você irá verificar que o contador de acessos foi reiniciado. Isso acontece porque o banco de dados não sabe onde deve persistir a informação sobre os acessos.

## Volume persistente

Para adicionarmos persistência ao banco de dados precisamos editar o `Azkfile.js` adicionando as entradas `command` e `mounts` ao sistema `redis` conforme o exemplo abaixo:

!INCLUDE "../../common/getting-started/persistent_example.md"

Com estas alterações, estamos instruindo ao `azk` para que monte a pasta `/data` e aponte para a mesma pasta dentro da estrutura do `azk`. Faça alguns _refresh_ na página, reinicie o `redis` e verá que a contagem agora persiste entre cada restart.

> **Observação 1:** A outra configuração incluída, o `command: ["redis-server", "--appendonly", "yes"]`, diz ao `azk` o modo como o sistema redis será iniciado. A instrução `--appendonly yes`, como descrito [aqui](http://redis.io/topics/persistence), configura o redis para persistir seus dados mesmo que ele seja reiniciado.

> **Observação 2:** Nem sempre os bancos de dados usam a mesma pasta `/data` para persistir os dados, isso deve ser configurado conforme a necessidade de cada banco de dados.
