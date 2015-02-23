# Contribuindo com azk

1. [Faça parte](README.html#faa-parte)
1. [Dúvidas e suporte](README.html#dvidas-e-suporte)
1. [Como reportar erros](README.html#como-reportar-erros)
1. [Desenvolvimento do azk](README.html#desenvolvimento-do-azk)


## Faça parte

O `azk` é inteiramente _Open Source_ e seu código-fonte está disponível pelo repositório no [github]. Estamos sempre precisando de ajuda para identificar falhas, criações de testes, solução de [issues] e documentação.


## Dúvidas e suporte

A documentação do `azk`, esta que você está lendo no momento, é a principal fonte de informações sobre o projeto. Existe ainda um chat ([gitter]) que pode ser bastante útil para tirar dúvidas em tempo real diretamente com nossa equipe de desenvolvedores.


## Como reportar erros

Os erros são reportados criando-se novas [issues] pelo [github]. Por favor, antes de criar novas [issues] verifique se elas já não foram criadas previamente.


## Desenvolvimento do azk

O código do `azk` é escrito em [node.js]. Utiliza várias features do ES6 e, como ainda não estão disponíveis numa versão estável, o código recebe um passo de _compilação_ para que possa ser corretamente interpretado pelo [node.js] na versão atual. Utilizamos o [Google Traceur] que fornece muitas funcionalidades do ES6 (vide: [traceur compat-table]). Durante a transformação do código de ES6 para ES5 deixamos o `source-map` sempre ativado. Isso permite que o código gerado exiba os erros corretamente apontando para o código-fonte original (anterior a transformação).


### Detalhes de implementação

Uma coisa que logo se nota ao começar a mergulhar no código do `azk` é a utilização de `promises` com `generators`. Isso permite que o nosso código assíncrono fique parecido com um código síncrono, deixando mais fácil a leitura do código. Utilizamos a biblioteca de promises [Q] que já possui suporte a generators.


### Pastas

- `/bin`: Executáveis do azk: `adocker` e `azk`
- `/docs`: Documentação do `azk` em formato gitbook
- `/shared`:
    - `Azkfile.js`: Azkfile.js principal do `azk`. Leva o dns e o balancer.
    - `locales/en-US.js`: Todas as mensagens e textos exibidos pelo cliente do `azk` estão aqui.
    - `templates/Azkfile.mustache.js`: Template de um Azkfile escrito em mustache
- `/spec`: Todos os testes do `azk`
- `/src`: Código fonte do `azk`
- `.jscsrc`: Define o padrão de estilo de código
- `.jshintrc`: Define a validação de sintaxe javascript
- `Makefile`: Tarefas para empacotamento de versão
- `npm-shrinkwrap.json`: Trava as versões do `package.json`
- `package.json`: Todas as dependências do `azk`


### Qualidade e estilo de código

Utilizamos o `.jshintrc` e o `.jscsrc` configurados com o `esnext` ativado, ou seja, com várias features do ES6. Veja pelos links abaixo a melhor forma de configurar seu editor para integrar essas ferramentas de verificação de qualidade:

- **jscs**: http://jscs.info/overview.html
- **jshint**: http://jshint.com/install/index.html


### Testes

O azk utiliza como framework de testes a biblioteca [mocha]. O [grunt] coordena as tarefas necessárias do dia a dia.

Para executar os testes do azk, o `azk agent` deve estar em execução:

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

Podemos filtrar os testes para a resolução de alguma parte especifíca.

```bash
$ azk nvm grunt [test|slow_text] --grep="Azk command init run"
```


### Contribuindo com código

Trabalhamos com o formato de repositório distribuído ([Forking Workflow]). Esta é a forma clássica do Github. Para melhorar ainda mais a organização e preparação das novas versões, optamos por utilizar as idéias do [git flow], descritas por Jeff Kreeftmeijer em seu famoso blog post: "Using git-flow to automate your git branching workflow".

Um exemplo de fluxo de trabalho:

```
$ git clone https://github.com/azukiapp/azk.git
$ git checkout -b feature/feature_name develop
# Make some changes to files
$ git add .
$ git commit -m "[my new feature] Fixing some system tests #9283"
$ git push
# Make pull request from your feature branch to azk's develop branch
```

Sempre que for contribuir para o `azk` faça um fork do `azk` diretamente pelo [github]. Toda contribuição é feita através de _Pull Requests_ para o repositórios principal na branch **`develop`** (Atenção: não esqueça de selecionar a branch develop quando for enviar o pull request).

##### Resumo das branchs:

- `master`: Versão atual de produção

- `develop`: Branch para integração das features que farão parte do próximo release

- `release/x.x.x`: Um release especifico onde serão feitas as últimas correções antes de se lançar a versão final

- `feature/understandable_feature_name`: Uma _feature_ em desenvolvimento ou a espera de integração que fica no repositório pessoal do desenvolvedor


##### Formato de commit:

Sempre que for fazer um commit, utilize o seguinte padrão:


`[nome da feature sendo alterada] commentário #NUMERO_DA_ISSUE`

- `nome da feature sendo alterada`: Nome reduzido, geralmente o mesmo nome utilizado na branch sem underscore
- `commentário`: A mensagem do commit em si. **Sempre em inglês** e iniciando com gerúndio
- `#NUMERO_DA_ISSUE`: Identificador numérico da `issue` relacionada

>Dessa forma fica fácil depois consultar e filtrar o histórico do git e saber de onde vem as alterações.

###### Exemplo:

```
$ git commit -m "[my new feature] Fixing some system tests #9283"
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
