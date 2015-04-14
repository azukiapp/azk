# Azkfile.js

O **Azkfile.js** é a espinha dorsal do funcionamento do `azk`. Sua principal função é descrever a arquitetura da sua aplicação, bem como marcar qual o diretório principal da mesma.

É esperado que o **Azkfile.js** seja incluído junto aos arquivos da aplicação no seu controle de versão. Isso permite que os outros membros do time possam utilizar o `azk` para controlar o ambiente e a execução das aplicações em suas próprias estações.

Como sugere a extensão `.js` o **Azkfile.js** é escrito em JavaScript, mas nenhum conhecimento avançado de JavaScript é necessário para edita-lo. Sua lógica é realmente simples e basicamente descreve como o `azk` deve prover o ambiente para executar os sistemas que formam sua aplicação.

Todas as propriedades disponíveis no **Azkfile.js** e suas descrições podem ser encontradas na [seção Referência](../reference/azkfilejs/README.md).

# Exemplo completo de Azkfile.js

Obs: este é um exemplo de `Azkfile.js` com todas as opções, mas não é um `Azkfile.js` que descreve uma aplicação valida. Utilize apenas como referência.

!INCLUDE "../../common/azkfilejs/full_example.md"
