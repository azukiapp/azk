# Configurando o projeto

O primeiro passo para utilizar o `azk` em qualquer projeto é criar um arquivo `Azkfile.js`. Este arquivo tem como função marcar o diretório root do seu projeto e principalmente definir a *arquitetura da aplicação*.

O `Azkfile.js` pode ser criado manualmente, mas para facilitar esse processo temos o `azk init`. É um comando gerador de `Azkfile.js` que irá fazer o trabalho pesado de descobrir como sua aplicação está desenhada e sugerir um `Azkfile.js` pré-configurado.

> Nota: Lembre-se que você ainda pode precisar editar o `Azkfile.js` gerado pelo `azk init` para que ele funcione corretamente com sua aplicação.

```bash
$ cd azkdemo
$ azk init
azk: [azkdemo] A `node` system was detected at '/Users/gmmaster/Works/azuki/azkdemo'.
azk: [azkdemo] The image suggested was `{"docker":"azukiapp/node:0.12"}`.
azk: [azkdemo] ! It was not possible to detect the `node` specific version, so the standard version was suggested instead.
azk: [azkdemo] ! To change the image version you must edit the `Azkfile.js` file.
azk: [azkdemo] ! For more information see the documentation at http://docs.azk.io/en/images/index.html.
azk: 'Azkfile.js' generated

Tip:
  Adds the `.azk` to .gitignore
  echo '.azk' >> .gitignore
```

Isso deve gerar o `Azkfile.js`:

!INCLUDE "../../common/getting-started/Azkfile_project_configure.md"

Na seção [Azkfile.js](../azkfilejs/README.md) você encontra informações detalhadas sobre como construir um `Azkfile.js` e quais opções estão disponíveis. Por hora, temos o suficiente para executar nossa aplicação.
