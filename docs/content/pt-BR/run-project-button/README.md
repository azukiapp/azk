## O botão `Run Project`

Clicando no botão `Run Project` (ou botão `azk`) em um repositório do GitHub é a melhor forma de rodar seu código em ambiente local, de maneira rápida e segura.

![Run project](https://s3-sa-east-1.amazonaws.com/assets.azk.io/run-project-illustrative.png)

Para adicionar um botão `Run Project` a um repositório, você precisa apenas adicionar um Azkfile.js ao projeto e colocar a seguinte imagem em seu arquivo README.md (o exemplo a seguir é para um repositório hipotético de URL `https://github.com/username/repo` e com um branch chamado `azkfile` contendo o aquivo Azkfile.js):

```
[![Run project](https://s3-sa-east-1.amazonaws.com/assets.azk.io/run-project.png)](http://run.azk.io/start/?repo=username/repo&ref=azkfile)
```

Confira nossa [Galeria do botão `Run Project`](https://github.com/run-project/gallery/) com exemplos de 'forks' atualizados de projetos usando o botão `Run Project`. Se você quiser sugerir um novo projeto para a galeria, sinta-se à vontade para abrir uma 'issue' ou nos enviar um 'pull request' com seu projeto (no repositório da galeria, em ambos os casos).
