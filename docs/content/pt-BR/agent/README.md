# Agent

Para o correto funcionamento do `azk` dependemos da execução de alguns serviços:

* **Docker**: Sistema de containers responsável pelo gerenciamento de imagens e isolamento dos sistemas;

* **Máquina Virtual**: Como o runtime de containers do `Docker` é suportado apenas em máquinas com Linux, quando utilizado no Mac OS X o `azk` faz uso de uma máquina virtual (por hora apenas VirtualBox);

* **Serviço de DNS**: Responsável pela resolução de dns para o domínio `*.dev.azk.io`;

* **Balancer HTTP**: Serviço responsável por balancear a carga das chamadas aos sistemas http que você estiver orquestrando com `azk`;

Para que você não tenha que gerenciar cada um destes serviços manualmente o `azk` conta com o que chamamos de `azk agent`, um serviço que precisa estar rodando para que você possa utilizar o `azk` em todo seu potencial.

Para gerenciar a execução do _agent_ contamos com o comando `azk agent`, para uma lista completa de opções [acesse](../reference/cli/agent.md).
