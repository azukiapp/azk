# Contribuindo

## Testes

O azk utiliza como framework de testes a biblioteca de JavaScript: [mocha] e a ferramenta de task [grunt].

Para executar os testes do azk, você deve obrigatoriamente estar com o azk agent em execução, então faça:

```bash
$ azk agent start
...
azk: Agent has been successfully started.
$ azk nvm grunt test
```

Isto deve executar o set de testes padrão do azk. Toda via alguns testes são considerados lentos, e por isso ficam fora de set inicial. Para executar todo o set de testes inclusive os testes lentos faça:

```bash
$ azk nvm grunt slow_test
```

Por fim para executar algum testes especifico pode ser usar um grep para escolher o testes:

```bash
$ azk nvm grunt [test] --grep="Azk command init run"
```

[mocha]: http://visionmedia.github.io/mocha/
[grunt]: http://gruntjs.com/
