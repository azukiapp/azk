# Contribuindo com azk

1. [Faça parte](README.html#faa-parte)
1. [Dúvidas e suporte](README.html#dvidas-e-suporte)
1. [Como reportar erros](README.html#como-reportar-erros)
1. [Desenvolvimento do azk](README.html#desenvolvimento-do-azk)

## Faça parte

O `azk` é inteiramente _Open Source_ e seu código-fonte está disponível pelo repositório no [github]. Estamos sempre precisando de ajuda para identificar falhas, criações de testes, solução de [issues] e documentação.


## Dúvidas e suporte

O manual do `azk`, este aqui que você está lendo no momento, é a fonte principal de informações sobre o `azk`. Existe ainda um chat ([gitter]) que pode ser bastante útil para tirar dúvidas em tempo real diretamente com nossa equipe de desenvolvedores.


## Como reportar erros

Os erros são reportados criando-se novas [issues] pelo [github]. Por favor, antes de criar novas [issues], verifique se elas já não foram criadas previamente.


## Desenvolvimento do azk

O código do `azk` é escrito em [node.js]. Utiliza várias features do ES6 e, que como ainda não está disponível numa versão estável, o código recebe um passo de _compilação_ para que possa ser corretamente interpretado pelo [node.js] na versão atual. Utilizamos o [Google Traceur] que fornece muitas funcionalidades do ES6 (vide: [traceur compat-table]). Durante a a transformação do código de ES6 para ES5 deixamos o `source-map` sempre ativado. Isso permite que o código gerado exibas os erros corretamente apontando para o código-fonte original (anterior a transformação).

### Detalhes de implementação

Um coisa que logo se nota ao começar a mergulhar no código do `azk` é a utilização de `promisses` com `generators`. Isso nos permite que o nosso código assincrono fique parecido com um código sincrono, deixando mais fácil a leitura do código. Utilizamos a biblioteca de promises [Q] que já possui suporte a generators.

### Pastas

- `/bin`: executáveis do azk: `adocker` e `azk`
- `/docs`: documentação do `azk` em formato gitbook
- `/shared`:
    - `Azkfile.js`: Azkfile.js principal do `azk`. Levando o dns e o balancer.
    - `locales/en-US.js`: Todas as mensagens e textos exibidos pelo cliente do `azk` estão aqui.
    - `templates/Azkfile.mustache.js`: template de um Azkfile escrito em mustache
- `/spec`: todos os testes do `azk`
- `/src`: código fonte do `azk`
- `.jscsrc`: define o padrão de estilo de código
- `.jshintrc`: define a validação de sintaxe javascript
- `Makefile`: tarefas para empacotamento de versão
- `npm-shrinkwrap.json`: trava as versões do `package.json`
- `package.json`: todas as dependências do `azk`

### Qualidade e estilo de código

Utilizamos o `.jshintrc` e o `.jscsrc` configurados com o `esnext` ativado, ou seja, com várias features do ES6. Veja pelos links abaixo a melhor forma de configurar seu editor para integrar essas ferramentas de verificação de qualidade:

- **jscs**: http://jscs.info/overview.html
- **jshint**: http://jshint.com/install/index.html

### Testes

O azk utiliza como framework de testes a biblioteca [mocha]. O [grunt] coordena as tarefas necessárias ao dia a dia.

Para executar os testes do azk o `azk agent`deve estar em execução:
```bash
$ azk agent start
...
azk: Agent has been successfully started.
$ azk nvm grunt test
```

##### Todos os testes inclusive os "lentos"
```bash
$ azk nvm grunt slow_test
```

##### Todos os testes excluindo os testes "lentos"
```bash
$ azk nvm grunt test
```

##### Filtrando os testes
Podemos filtrar os testes para a resolução de alguma parte em especifico.
```bash
$ azk nvm grunt [test|slow_text] --grep="Azk command init run"
```


### Contribuindo com código

Trabalhamos com o formato de repositório distribuído ([Forking Workflow]). Este é a forma clássica do Github. Para melhorar ainda mais a organização e preparação das novas versões, optamos por utilizar as idéias do [git flow], descritas por Jeff Kreeftmeijer em seu famoso blog post: "Using git-flow to automate your git branching workflow".

Sempre que for contribuir para o `azk` faça um fork do `azk` diretamente pelo [github]. Toda contribuição é feita através de _Pull Requests_ para o repositórios principal na branch **`develop`** (Atenção: não esqueça de selecionar a branch develop quando for enviar o pull request).

##### resumo das do branchs git flow:

- `master`: versão atual de produção

- `develop`: branch para integração das features que farão parte do próximo release

- `release/x.x.x`: um release especifico onde serão feitas as ultimas correções antes de se lançar a versão final

- `feature/understandable_feature_name`: uma _feature_ em desenvolvimento ou a espera de integração que fica no repositório pessoal do desenvolvedor.

##### formato de commit:

Sempre que for fazer um commit será interessante o uso do seguinte padrão:


`[understandable feature name] commentário #NUMERO_DA_ISSUE`

- `understandable feature name`: nome reduzido, geralmente o mesmo nome utilizado na branch sem underscore
- `commentário`: A mensagem do commit em si. **Sempre em inglês** e iniciando com gerúndio.
- `#NUMERO_DA_ISSUE`: Identificador numérico da `issue` relacionada

>Dessa forma fica fácil depois consultar e filtrar o histórico do git. Dá para saber de onde vem as alterações.

###### Exemplo:
```
git commit -m "[my new feature] Fixing some system tests #9283"
```


[mocha]: http://visionmedia.github.io/mocha/
[grunt]: http://gruntjs.com/
[github]: https://github.com/azukiapp/azk
[issues]: https://github.com/azukiapp/azk/issues
[pull requests]: https://github.com/azukiapp/azk/pulls
[gitter]: https://gitter.im/azukiapp/azk
[git flow]: http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/
[Forking Workflow]: https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow
[Google Traceur]: https://github.com/google/traceur-compiler
[traceur compat-table]: http://kangax.github.io/compat-table/es6/#tr
[node.js]: http://nodejs.org/
[Q]: https://github.com/kriskowal/q/wiki/API-Reference#generators
