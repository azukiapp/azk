# Rodando a aplicação

Uma vez que o `Azkfile.js` esteja criado, estamos prontos para levantar nossa aplicação:

```bash
$ azk start -vv
```

A saída do comando acima deve ser algo parecido com isso:

```bash
azk: ↑ starting `azkdemo` system, 2 new instances...
azk: ✓ checking `dockerfile/nodejs:latest` image...
azk: ⇲ downloading `dockerfile/nodejs:latest` image...
// download progress output...
  9a76e1635147: Download complete
azk: ↻ provisioning `azkdemo` system...
npm WARN package.json azk-hello@0.0.1 No repository field.
// long output
// download node dependences ...
azk: ◴ waiting start `azkdemo` system, try connect port http/tcp...
azk: ◴ waiting start `azkdemo` system, try connect port http/tcp...

┌───┬────────┬────────────┬───────────────────────┬────────────────────────────┬───────────────────┐
│   │ System │ Instances  │ Hostname              │ Instances-Ports            │ Provisioned       │
├───┼────────┼────────────┼───────────────────────┼────────────────────────────┼───────────────────┤
│ ↑ │ azkiso │ 2          │ http://azkdemo.azk.dev│ 2-http:49154, 1-http:49153 │ a few seconds ago │
└───┴────────┴────────────┴───────────────────────┴────────────────────────────┴───────────────────┘
```

Se tudo ocorreu conforme o esperado agora você pode acessar [http://azkdemo.azk.dev](http://azkdemo.azk.dev) e a seguinte tela deve aparecer:

![Figure 1-1](../resources/images/start_1.png)

Observe que ao atualizar a página algumas vezes o `instance id` é alterado para um outro valor. Isso ocorre pois existe um balanceador de carga que aponta para uma das 2 instâncias do site.

Na saída do `azk status` podemos conferir que existem 2 instâncias do sistema azkdemo:

```
$ azk status

┌───┬─────────┬────────────┬────────────────────────┬────────────────────────────┬───────────────┐
│   │ System  │ Instances  │ Hostname               │ Instances-Ports            │ Provisioned   │
├───┼─────────┼────────────┼────────────────────────┼────────────────────────────┼───────────────┤
│ ↑ │ azkdemo │ 2          │ http://azkdemo.azk.dev │ 2-http:49168, 1-http:49167 │ 3 minutes ago │
│   │         │            │                        │                            │               │
└───┴─────────┴────────────┴────────────────────────┴────────────────────────────┴───────────────┘
```

Esta configuração, de se usar duas instâncias, está definida no Azkfile.js (gerado no [passo anterior](configs-project.md)):

    scalable: {"default": 2},