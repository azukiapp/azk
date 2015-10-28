# Contribuindo para o azk

Antes de tudo, você é incrível! Obrigado por contribuir com o `azk`!

Existem diversas maneiras de ajudar, e todas elas são bem-vindas:

1. Abrir issues
1. Comentar em issues abertos
1. Fazer PRs
1. Testar PRs
1. Escrever testes
1. Escrever documentação
1. Arrumar erros de escrita

Abaixo, você pode encontrar algumas seções com informações mais detalhadas. Recomendamos também dar uma olhada no próprio guia do GitHub "[Contributing to Open Source on GitHub](https://guides.github.com/activities/contributing-to-open-source/)".

## Seções

1. [Dúvidas e suporte](#dvidas-e-suporte)
1. [Abrir issues](#abrir-issues)
1. [Dicas e orientações](#dicas-e-orientaes)
    1. [Estrutura das pastas](#estrutura-das-pastas)
    1. [Detalhes de implementação](#detalhes-de-implementao)
    1. [Qualidade e estilo do código](#qualidade-e-estilo-do-cdigo)
    1. [Ferramenta de tarefas - Gulp](#ferramenta-de-tarefas---gulp)
1. [Pull Requests](#pull-requests)
    1. [JavaScript e Node.js](#javascript-e-nodejs)
    1. [Contribuir com código](#contribuir-com-cdigo)
    1. [Organização de branches](#organizao-de-branches)
    1. [Convenções](#convenes)
        1. [Branches](#branches)
        1. [Mensagens de commit](#mensagens-de-commit)
    1. [Testes](#testes)
        1. [Testes de integração](#tests-de-integrao)
        1. [Filtrar testes](#filtrar-testes)
    1. [Adicionando ou atualizando dependências](#adicionando-ou-atualizando-dependncias)
    1. [Abrir Pull Requests](#abrir-pull-requests)
        1. [Formato do Pull Request](#formato-do-pull-request)


## Dúvidas e suporte

A documentação para o `azk`, que você está lendo agora, é a principal fonte de informações sobre o projeto. Temos também um bate-papo no [Gitter][gitter] em Inglês e Português que pode ser útil para fazer perguntas em tempo real, diretamente para a nossa equipe de desenvolvedores e outros membros da comunidade.


## Abrir issues

Os erros são comunicados através da criação de novas [issues] no [GitHub][github]. Elas nos ajudam a corrigir erros que possam ter escapado no nosso processo de teste ou release.

Antes de criar novas [issues] por favor, certifique-se de que não há outras similares já criadas. Se você encontrar alguma que seja semelhante, adicione um comentário :+1: nela, e também qualquer informação adicional que nos ajude a reproduzir o erro como: OS, versão do `azk`, comandos utilizados, Azkfile.js, etc.

Idealmente, uma issue deve conter uma descrição básica do seu sistema, uma descrição do erro, e instruções sobre como reproduzi-lo. Nós encorajamos você a abrir um problema mesmo se você não consiga se lembrar dos passos para realiza-lo novamente, ou reproduzi-lo (caso ele seja intermitente).

Um exemplo de um bom formato para uma issue:

> Toda a comunicação dentro do nosso repositório é feita em inglês, mas fique a vontade para escrever em português também.

Inglês:
```
Description of the problem:

`OS`:
`azk version`:

Environment details (VirtualBox, DigitalOcean, etc.):

Steps to Reproduce:
1.
2.
3.

Actual Results:

Expected Results:

Additional info:
```

Português
```
Descrição do problema:

`OS`:
`azk version`:

Detalhes do ambiente (VirtualBox, DigitalOcean, etc.):

Passos para reproduzir o erro:
1.
2.
3.

Resultado atual:

Resultado esperado:

Informação adicional:
```


## Dicas e orientações


### Estrutura das pastas

- `/bin`: binários do azk: `adocker` e `azk`.
- `/docs`: documentação no formato Gitbook.
- `/shared`:
    - `Azkfile.js`: Azkfile.js do próprio azk. Configura o dns e o load balancer.
    - `locales/en-US.js`: Todas as mensagens e textos mostrados no cli.
    - `templates/Azkfile.mustache.js`: Template de um Azkfile.js escrito em mustache (usando [Handlebars][handlebars]).
- `/spec`: Todos os testes do `azk`.
- `/src`: Código fonte.
- `/lib`: Código fonte compilado.
- `.dependencies`: Arquivo onde as versões das dependências são definidas.
- `.jscsrc`: Configura o padrão de estilo de código.
- `.jshintrc`: Configura a validação da sintaxe do JavaScript.
- `Makefile`: Tarefas de empacotamento.
- `npm-shrinkwrap.json`: Especifica as versões das dependências listadas no `package.json`.
- `package.json`: Todas as dependências do `azk`.
- `gulpfile.js`: Tarefas do gulp. Para mais informações, execute `azk nvm gulp help`.


### Detalhes de implementação

O código do `azk` é escrito em [Node.js][node.js]. Ele usa vários recursos de ES6 que ainda não estão disponíveis em uma versão estável, e por isso o código passa por uma etapa de _compilação_ para que ele possa ser interpretado corretamente pela versão atual do [Node.js][node.js]. Nós usamos o [babeljs] para isso, que oferece muitos recursos de ES6 (ver: [babeljs compat-table]). Durante o processo de "transpilation", nós sempre configuramos o `source-map` para "on". Isso permite que o código gerado mostre os erros que apontando corretamente para o código-fonte original.

Uma coisa que você vai notar logo que começar a mergulhar no código do `azk` é o uso de `promises` com `generators`. Isso permite que o nosso código assíncrono torne-se mais semelhante ao código síncrono, tornando-o mais fácil de ler. Usamos a biblioteca de promessas [bluebird-generators] que suporta `generators`.


### Qualidade e estilo do código

Nós utilizamos o `.jshintrc` e o `.jscsrc` configurados com o `esnext` ligado, ou seja, com várias features do ES6. Veja os links abaixo para descobrir a melhor forma de configurar seu editor com essas ferramentas de qualidade de código:

- **jscs**: http://jscs.info/overview.html
- **jshint**: http://jshint.com/install/index.html

Além disso, nós utilizamos o arquivo `.editorconfig` para manter a consistência do estilo de código, independente da IDE ou editor que qualquer um esteja usando. Você pode ver mais informações sobre arquivos EditorConfig [aqui](http://editorconfig.org/), e também ver como o nosso está configurado [aqui](https://github.com/azukiapp/azk/blob/master/.editorconfig).


### Ferramenta de tarefas - Gulp

Para o desenvolvimento do `azk`, usamos o [gulp] para coordenar as tarefas do dia-a-dia de desenvolvimento, tais como:

- "Transpilar" arquivos `es5` para `es6` com [babeljs];
- Verificar a qualidade do código com `jshint` e `jscs`;
- A execução de um comando "watch" para modificação dos arquivos e execução das tarefas acima automaticamente;

Você pode encontrar a lista completa de comandos disponíveis executando: `azk nvm gulp help`, mas a tarefa principal que você deve conhecer e usar durante o desenvolvimento é `azk nvm gulp watch:test:lint`.


## Pull Requests

Antes de tudo, instale o azk a partir do código-fonte:

```bash
$ git clone https://github.com/azukiapp/azk.git
$ cd azk
$ make
```

Então adicione o caminho para o binário do azk a variável de ambiente PATH, ou crie um alias para ele.

Existem passos adicionais que você precisará seguir caso esteja realizando a instalação no Mac ou no Linux (por exemplo, realizar a instalação do `libnss-resolver`). Olhe [essa página da documentação](../installation/source-code.md) para instruções mais detalhadas.


### JavaScript e Node.js

Como mencionado na seção "Detalhes de implementação", o `azk` é escrito em [Node.js][node.js], e utiliza vários recursos do ES6. Uma coisa a notar é que, para ajudar no desenvolvimento e contribuir para o `azk`, você não precisa ter Node.js instalado em sua máquina.

O `azk` possui uma versão do Node.js, que é o mesmo que usamos para testá-lo e desenvolvê-lo, dentro da pasta "`./lib/nvm`". Ele já vem instalado e empacotado quando você baixa o `azk` através de um gerenciador de pacotes, ou ele também é instalado caso você baixe o projeto do GitHub e execute `make` para construir seu binário. Isso significa que nós podemos:

1. Ter certeza de que o `azk` está sendo executado e usando uma versão do Node.js que testamos.
2. Não exigir que o usuário possua o Node.js instalado em sua máquina, e caso ele esteja instalado, não afetar o ambiente de desenvolvimento de qualquer forma.

Durante o desenvolvimento, no caso de você querer usar comandos node, você pode executar:

```sh
$ azk nvm node [command]

# Ou

$ azk nvm npm [command]
```

Caso você queira instalar alguma dependência, o processo será algo como:

```sh
$ azk nvm npm install gulp
```

E então você poderá usar o módulo com:

```sh
$ azk nvm gulp
```


### Contribuir com código

Todas as contribuições de código são bem-vindas, seja ela para consertar uma issue ou adicionar novas funcionalidades.

O fluxo de trabalho geral segue estes passos:

- Abra uma issue / Encontre uma issue aberta / Sugerir uma feature através da nossa página de issues no GitHub
- Discutir a  issue/feature com nossa equipe de desenvolvedores e membros da comunidade
- Pegar a issue/feature para você consertar/criar
- Fork `azk`
- Criar uma "feature branch" e começar a trabalhar
- Sincronizar o seu trabalho com a branch master de tempos em tempos
- Abrir um PR e iterar
- PR aceito e merged!

Em comandos shell, isso será algo parecido com:

```sh
# Fork o repositório do azk
$ git clone https://github.com/your_username/azk.git
$ cd azk
$ git checkout -b feature/feature_name
# Faça mudanças nos arquivos
$ make
# Execute os testes
$ azk nvm npm test
$ git add .
$ git commit -m "[my new feature] Fixing some system tests"
$ git push
# Abra o PR da sua feature branch para a master branch do azk
```

Lembre-se de fazer um fork diretamente no [GitHub][github]. Todas as contribuições são feitas através de _Pull Requests_ na branch **`master`** do repositório principal.

### Organização de branches

- `master` é a branch de desenvolvimento.

  A branch **`master`** é onde novas features são iniciadas, e onde elas serão "merged".

- `stable` é a versão estável.

  A branch **`stable`** é a versão mais recente e estável do `azk`. É ela que utilizamos para construir os binários, disponíveis nos gerenciadores de pacotes.


### Convenções


#### Branches

Ao criar uma branch na qual você irá trabalhar, lembre-se de nomeá-la como `feature/feature_name`.


#### Mensagens de commit

As mensagens de commit seguem uma convenção:

```sh
git commit -m '[YOUR_BRANCH_NAME] comment'
```

Isso nos ajuda ao consultar e filtrar o histórico do git no futuro, para ver de onde as mudanças vieram.


### Testes

O `azk` utiliza o [mocha] como o framework de testes, e o [gulp] coordena as tarefas necessárias para o uso diário.

Para executar os testes do `azk`, o `azk agent` deve estar em execução:

```bash
$ azk agent start
...
azk: Agent has been successfully started.
$ azk nvm npm test
```


#### Testes de integração

Os testes de integração do `azk` são escritos utilizando [bats], e podem ser encontrados dentro da pasta "`specs/integration`". Antes de rodar os testes você precisará instalar algumas dependências:

```bash
$ make dependencies
```

E então você poderá executá-los com:

```bash
$ azk nvm gulp integration
```

Note que para rodar os testes, é necessário que o `azk agent` esteja em execução.


#### Filtrar testes

Nós podemos filtrar os testes a serem executados por seções específicas, ou individualmente, com:

```bash
$ azk nvm gulp test --grep="Azk command init run"
```

Similar aos testes funcionais, você pode filtrar os testes de integração com:

```bash
$ azk nvm gulp integration --grep="force to replace a"
```


### Adicionando ou atualizando dependências

Para ajudar a gerenciar as dependências do `azk`, nós utilizamos o `npm shrinkwrap` para realizar o "lock" das versões que usamos (mais informações sobre isso [aqui](https://docs.npmjs.com/cli/shrinkwrap)). Por isso, se você precisar adicionar uma dependência ao `azk`, ou atualizar uma já existente, certifique-se de gerar o arquivo [`npm-shrinkwrap.json`](https://github.com/azukiapp/azk/blob /master/npm-shrinkwrap.json) novamente.

Você pode encontrar mais informações sobre os comandos necessários para fazer isso [aqui](https://docs.npmjs.com/cli/shrinkwrap#building-shrinkwrapped-packages), mas deve ser simples como:

1. Execute "npm install" no root do pacote para instalar as versões atuais de todas as dependências.
1. Adicionar ou atualizar dependências. "npm install" cada pacote novo ou atualizado individualmente e depois atualizar o package.json. Note-se que eles devem ser explicitamente chamados para serem instalados: executando npm install sem argumentos irá somente reproduzir o shrinkwrap existente.
1. Confirme que o pacote funciona como previsto com as novas dependências.
1. Execute "npm shrinkwrap", "commit" o novo npm-shrinkwrap.json, e publique o pacote.


### Abrir Pull Requests

Antes de abrir um Pull Request, certifique-se de que você:

- Testou o binário do azk com suas alterações:

```sh
$ make
# Tenha certeza de que o azk sendo executado é o da pasta de desenvolvimento, não do package manager
$ azk nvm npm test
```

- "Merge" de forma limpa com a branch master

Seu trabalho deve fazer o "merge" de forma limpa com a branch master. No caso de haver commits adicionais feito na branch master depois de você ter criado sua branch, faça um `git rebase`:

```sh
$ git remote add upstream https://github.com/azukiapp/azk.git
$ git fetch --all
$ git checkout master
$ git merge upstream/master
$ git checkout feature/your_feature_name
$ git rebase master
```

Caso você já tenha feito um push para seu repositório, após fazer um `rebase` será necessário fazer um `git push -f`.

- Ter commits que são pequenas unidades lógicas de trabalho

Durante o desenvolvimento, você pode acabar com um grande número de commits que podem ter mensagens confusas, ou partes do trabalho que poderiam estar juntas. Uma coisa que você pode fazer é usar o `git rebase -i` para modificar seus commits anteriores. Essas mudanças podem variar de simplesmente certificar-se de que todas as mensagens seguem as convenções do repositório, quanto para juntar as mudanças feitas em diversos commits a um único.

```sh
$ git rebase -i HEAD~X
# X sendo o número de commits que você quer modificar
```

Caso você precise de ajuda para fazer qualquer uma das coisas acima, basta abrir um PR e nós vamos ajudá-lo através dele. :)

#### Formato do Pull Request

Ao abrir um pull request, você deve incluir as seguintes informações:

> Toda a comunicação dentro do nosso repositório é feita em inglês, mas fique a vontade para escrever em português também.

Inglês
```
Issues that are closed by this PR (Use they keyword "closes", so the issues are closed automatically after the work is merged)

Description of the pull request:

How to test the PR:
1.
2.
3.

Additional info:
```

Português
```
Issues que são fechadas pelo PR (Use a palavra-chave "closes", para que as issues sejam fechadas automaticamente após o trabalho ser "merged")

Descrição do pull request:

Como testar o PR:
1.
2.
3.

Informação adicional:
```


[babeljs]: http://babeljs.io
[babeljs compat-table]: https://babeljs.io/docs/learn-es6/
[bats]: https://github.com/sstephenson/bats
[Forking Workflow]: https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow
[git flow]: http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/
[github]: https://github.com/azukiapp/azk
[gitter]: https://gitter.im/azukiapp/azk
[gulp]: http://gulpjs.com/
[issues]: https://github.com/azukiapp/azk/issues
[mocha]: http://visionmedia.github.io/mocha/
[node.js]: http://nodejs.org/
[pull requests]: https://github.com/azukiapp/azk/pulls
[bluebird-generators]: https://github.com/kriskowal/q/wiki/API-Reference#generators
[handlebars]: http://handlebarsjs.com/
