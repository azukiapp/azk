# Variáveis de ambiente

Em geral, quase toda aplicação requer alguma forma de configuração. O `azk` utiliza a abordagem de [variáveis de ambiente][environment_variable] para configuração dos sistemas.

Variáveis de ambiente podem ser definidas em 4 lugares diferentes ou, em alguns casos especiais, podem ser definidas automaticamente.

Abaixo descrevemos em detalhe quais são estes lugares, em ordem de processamento (se uma variável de ambiente estiver definida em mais de um desses lugares, prevalece aquela processada por último).

## A partir das imagens

Conforme descrito [aqui](image.md) um sistema sempre requer uma imagem. Seja ela vinda de um repositório externo ou a partir de um arquivo de receita, ela pode conter definições de variáveis.

No exemplo abaixo temos um Dockerfile que define uma variável de ambiente:

```Dockerfile
FROM azukiapp/alpine
ENV NAME=david
```

## No `Azkfile`

No [Azkfile](../../azkfilejs/README.md), cada sistema declarado pode conter uma propriedade chamada [envs](envs.md), conforme o exemplo abaixo:

```js
systems({
  web: {
    image: { dockerfile: "./" },
    envs: {
      NAME: "joe",
      APP_ENV: "development",
    }
  }
});
```

Nesse exemplo, estamos sobrescrevendo a variável `NAME` declarada no exemplo anterior e adicionando uma nova variável chamada `APP_ENV`.

## No arquivo `.env`

Conforme a referência da propriedade [envs](envs.md) para o `Azkfile`, não é aconselhado a adição de informações sensíveis (senhas, chaves de API, etc.) diretamente na propriedade `envs` do `Azkfile`.

Como alternativa deve-se utilizar um arquivo `.env` no mesmo diretório do `Azkfile`, conforme descrito nesta [biblioteca][dotenv_ref]:

```sh
echo "API_KEY=FCB12" >> .env
echo "NAME=mike" >> .env
```

Nesse exemplo, estamos sobrescrevendo a variável `NAME` declarada no `Azkfile` do exemplo anterior.

## Auto inserida

Atualmente, temos dois casos onde variáveis de ambiente são adicionadas automaticamente no sistema:

### Portas

Uma série de variáveis de ambiente são criadas a partir das definições de portas do sistema, que podem estar no [próprio Azkfile](ports.md) ou na imagem utilizada.

O padrão de nomenclatura para essas variáveis de ambiente é `[PORT_NAME|PORT_NUMBER]_PORT`, onde:

- `PORT_NAME` é o nome da porta definido no `Azkfile`;
- `PORT_NUMBER` é o número da porta (utilizado no caso das portas definidas na imagem mas não nomeadas no `Azkfile`);

### Porta http

Uma variável chamada `HTTP_PORT` é inserida quando a propriedade [http](http.md) é definida em um sistema.

O valor padrão dessa variável é `5000`, mas é possível mudar isso adicionando uma porta nomeada como `http` na propriedade `ports` do `Azkfile`.

### Vindas de outros sistemas

Quando você declara que um sistema **A** depende do outro **B**, utilizando a propriedade [depends](depends.md) no sistema **A**, as seguintes variáveis de ambiente são inseridas no sistema **A**:

- **port e host**: quatro variáveis para cada porta exposta do sistema **B**, no padrão:
    - `[B_SYSTEM_NAME]_[PORT_NAME]_PORT`
    - `[B_SYSTEM_NAME]_[PORT_NUMBER]_PORT`
    - `[B_SYSTEM_NAME]_[PORT_NAME]_HOST`
    - `[B_SYSTEM_NAME]_[PORT_NUMBER]_HOST`

- **export_envs**: as variáveis de ambiente definidas na propriedade [export_envs](export_envs.md) do sistema **B** são inseridas no sistema **A**.

## No shell

Ao executar o comando [azk shell](../cli/shell.md), é possível informar uma nova variável de ambiente ou sobrescrever qualquer uma das variáveis definidas acima.

```
azk shell web -e NAME=gullit -e FOO=bar
```

-----------------------------

## Auto expansão de variáveis

No processo de parse e execução de um sistema, as variáveis de ambiente utilizadas na declaração das propriedades do sistema são expandidas para os seus valores (conforme a ordem de processamento descrita anteriormente):

```js
systems({
  web: {
    image: { dockerfile: "./" },
    command: ["start.sh", "--name", "$NAME", "--port", "${HTTP_PORT}"],
    http: {
      domain: ["#{system.name}.#{azk.default_domain}"],
    },
    ports: {
      http: "3000/tcp",
    },
    envs: {
      NAME: "joe",
      APP_ENV: "development",
    }
  }
});
```

Nesse caso, o `command` resultante será:

```sh
start.sh --name joe --port 3000
```

!INCLUDE "../../../links.md"
