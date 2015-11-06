# Linux

!INCLUDE "warning.md"

## Requirements

* **Distributions (tested)**: Ubuntu 12.04/14.04/15.04 and Fedora 20/21/22
* **Architecture**: 64-bits
* [Docker][docker] 1.8.1
* Not running any services on ports `80` and `53`

**Important**: If you are running any service on port `80` and/or `53` you must customize the configuration of `azk` setting the following variables `AZK_BALANCER_PORT` and `AZK_DNS_PORT` respectively, before running `azk agent start`.

## Installing the newest Docker version

There are two ways to install Docker:

1. Express installation:

  ```bash
  $ curl -sSL https://get.docker.com/ | sh
  # or
  $ wget -qO- https://get.docker.com/ | sh
  ```

2. Manual installation:

  - [Ubuntu][docker_ubuntu_installation]
  - [Fedora][docker_fedora_installation]

## Granting access to Docker service to your user

The docker daemon binds to a Unix socket instead of a TCP port. By default that Unix socket is owned by the user root and other users can access it with sudo. For this reason, docker daemon always runs as the root user.

To avoid having to use sudo when you use the docker command, create a Unix group called docker and add users to it. When the docker daemon starts, it makes the ownership of the Unix socket read/writable by the docker group.

> **Warning**: The docker group is equivalent to the root user; For details on how this impacts security in your system, see [Docker Daemon Attack Surface][docker_daemon_attack_surface] for details.

To create the docker group and add your user:

1. Log into Ubuntu as a user with sudo privileges;

2. Create the docker group and add your user

  ```bash
  $ sudo usermod -aG docker $(id -un)
  ```

3. Log out and log back in

  This ensures your user is running with the correct permissions.

4. Verify your work by running docker without sudo

  ```bash
  $ docker run hello-world
  ```

  If this fails with a message similar to this:

  ```bash
  Cannot connect to the Docker daemon. Is 'docker daemon' running on this host?
  ```

  Check that the `DOCKER_HOST` environment variable is not set for your shell. If it is, unset it.

## Disabling dnsmasq service (Ubuntu-only)

In desktop systems running Ubuntu or one of its derivatives, there is a default dns service (dnsmasq)
that conflicts with azk built-in dns service.

To solve this, it's needed to stop dnsmasq and ensure it won't be auto started after the next login.
To do this, run:

  ```bash
  $ sudo service dnsmasq stop
  $ sudo update-rc.d -f dnsmasq remove
  ```

## Installing azk

### Express installation

!INCLUDE "express.md"

### Ubuntu

1. Add the Azuki keys to your local keychain:

  ```bash
  $ sudo apt-key adv --keyserver keys.gnupg.net \
    --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
  ```

2. Add the Azuki repository to the apt sources list:

  ```bash
  # Ubuntu Precise (12.04)
  $ echo "deb [arch=amd64] http://repo.azukiapp.com precise main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list

  # Ubuntu Trusty (14.04)
  $ echo "deb [arch=amd64] http://repo.azukiapp.com trusty main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list

  # Ubuntu Wily (15.10)
  $ echo "deb [arch=amd64] http://repo.azukiapp.com wily main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list
  ```

3. Update the list of packages and install azk:

  ```bash
  $ sudo apt-get update
  $ sudo apt-get install azk
  ```

4. You can [start the azk agent](../getting-started/starting-agent.md) now, but, **make sure that the Docker service is running**;

### Fedora

1. Add the Azuki keys to your local keychain:

  ```bash
  $ rpm --import \
    'http://repo.azukiapp.com/keys/azuki.asc'
  ```

2. Add the Azuki repository:

  ```bash
  $ echo "[azuki]
  name=azk
  baseurl=http://repo.azukiapp.com/fedora20
  enabled=1
  gpgcheck=1
  " > /etc/yum.repos.d/azuki.repo
  ```

3. Install `azk` and its dependencies:

  ```bash
  $ sudo yum install azk
  ```

4. You can [start the azk agent](../getting-started/starting-agent.md) now, but, **make sure that the Docker service is running**;


### Other distributions

Coming soon...

!INCLUDE "../getting-started/banner.md"
!INCLUDE "../../links.md"
