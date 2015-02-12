# Configurando o projeto

O primeiro passo para utilizar o `azk` em qualquer projeto é criar um arquivo `Azkfile.js`. Este arquivo tem como função marcar o diretório root do seu projeto e principalmente definir a *arquitetura da aplicação*.

O `Azkfile.js` pode ser criado manualmente, mas para sua comodidade oferecemos o `azk init`, um gerador de `Azkfile.js` que irá fazer o trabalho pesado de descobrir como sua aplicação está desenhada e sugerir um `Azkfile.js`.

```bash
$ cd [path_demo]/azkdemo
$ azk init

azk: [node010] A `node` system was detected at '[path_demo]/azkdemo'.
azk: [node010] The image suggested was `{"docker":"node:0.10"}`.
azk: 'Azkfile.js' generated
```

Isso deve gerar o `Azkfile.js`:

!INCLUDE "../../common/getting-started/Azkfile_project_configure.md"

Na seção [Azkfile.js](../azkfilejs/README.md) você encontra informações detalhadas sobre como construir um `Azkfile.js` e quais opções estão disponíveis. Por hora, temos o suficiente para executar nossa aplicação.
