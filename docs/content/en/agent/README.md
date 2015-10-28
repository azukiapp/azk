# Agent

For `azk` to work correctly, it depends on the implementation of some services:

* **Docker**: Container system responsible for image management and systems isolation;

* **Virtual Machine**: Since the `Docker` runtime is only supported on Linux machines, when used in Mac OS X `azk` makes use of a virtual machine (VirtualBox for the time being);

* **DNS Service**: Responsible for dns resolution for the domain `*.dev.azk.io`;

* **HTTP Balancer**: Responsible for load-balancing the calls to systems you orchestrate with `azk`;

So you do not have to manage each of these services manually, `azk` has what we call the `azk agent`, a service that must always be running for you to use `azk`.

To manage the _agent_ service we have the command `azk agent`. For a complete list of options [visit the agent page](../reference/cli/agent.md).
