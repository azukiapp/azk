## azk agent

Controla o serviço `azk agent`. Este comando deve ser executado antes de levantar qualquer sistema.

#### Uso:

    $ azk [options] agent [options] {action}

_______________
### azk agent start

Inicia o `agent`.

#### Opções:

- `--daemon`      inicia em modo background
- `--no-daemon`   inicia em modo foregroung

#### Exemplos:

##### Inicia o _agent_ em _background_:

    $ azk agent start

##### Inicia o _agent_ em _foreground_:

    $ azk agent start --no-daemon

![Figure 1-1](../resources/images/agent_start.png)

_______________
### azk agent stop

Pára o `agent` quando este está em background.

#### Exemplos:

    $ azk agent stop

_______________
### azk agent status

Exibe a situção atual do `agent`.

#### Exemplos:

```
$ azk agent status
azk: Agent is running...
```
