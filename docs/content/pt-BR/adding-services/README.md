# Adicionando serviços

Antes de começar, certifique-se de ter o [azk instalado](../instalação/README.md).

Este tutorial assume que você tenha seguido a seção anterior [Começando](../getting-started/README.md), e que já está um pouco familiarizado com o `azk` e o `Azkfile.js`.

Uma das coisas legais que você pode fazer com `azk` é adicionar rapidamente serviços a sua aplicação, o que pode ajudar com testes, ou a rapidamente adicionar funcionalidades extra.

Neste guia, vamos começar com uma aplicação Node.js simples e adicionar o [MailCatcher](https://github.com/sj26/mailcatcher/) e o [ngrok](https://ngrok.com/) nela. Isso nos permitirá testar facilmente o envio de e-mails e a captura das informações contidas dentro deles, e também testar webhooks expondo a nossa aplicação dentro do `azk`.

## Baixando o projeto de exemplo

Para começar, vamos fazer o download do projeto de exemplo que iremos usar como base durante os próximos passos. Você pode:

*Clonar o repositório:*

```sh
$ git clone https://github.com/azukiapp/azkdemo-services
```

ou

*Fazer o download do projeto como um arquivo .zip:*

```sh
$ curl -L https://github.com/azukiapp/azkdemo-services/archive/master.zip -o azkdemo-services.zip
$ unzip azkdemo-services.zip
$ mv azkdemo-services-master azkdemo-services
```

> ** Nota **: Todos os comandos `cd [path_demo]/azkdemo-services` neste guia, levam em conta que `[path_demo]/` é o caminho onde o arquivo acima foi extraído, tenha o cuidado de sempre apontar para o caminho correto. ;)
