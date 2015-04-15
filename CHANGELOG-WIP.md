$ git diff master --name-only

  + npm-shrinkwrap.json

  + package.json

  + shared/locales/en-US.js
      - tradução da mensagem do analytics

  + spec/generator/index_spec.js  ( ? )

  + spec/utils/i18n_spec.js ( ? )

  + spec/utils/tracker_spec.js
      - testes do Tracker

  + src/cli/command.js
      - hack no `before_action` p/ criar o `after_action`

  + src/cli/helpers.js
      - implementacao do `askPermissionToTrack`

  + src/cli/interactive_cmds.js
      - cria um middleware (`TrackedCmds`) entre `InteractiveCmds` and `Command` p/ trackear todos os comandos

  + src/cli/tracked_cmds.js
      - implementação que cria filtros `before_action` e `after_action` p/ fazer os trackings do comandos

  + src/config.js
      - cria chave `paths:analytics` p/ setar storage dos dados do Tracker
      - cria chave `tracker` p/ setar chaves do keen.io

  + src/docker/docker.js
      - implementa hooks ao docker como `stop`, `remove`, `kill` p/ fazer coleta de dados de `container`

  + src/docker/run.js
      - implementa tracking de informacoes sobre o docker em si (?)

  + src/generator/rules/ruby.js   ( ? )

  + src/images/index.js
      - implementa tracking de `pull` e `build` das imagens

  + src/system/run.js ( ? )
      -

  + src/system/scale.js
      - implementa tracking do comando `scale` dos containers

  + src/utils/tracker.js
      - implementa utilizacao da api do insight-keen-io
