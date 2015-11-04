# Linux

> The easiest way to install azk is following [azk express installation](./README.html#azk-express-installation) section.

!INCLUDE "warning.md"

## Requirements

* Distributions (tested): Ubuntu 12.04/14.04/15.04 and Fedora 20/21/22/23
* Architecture: 64-bits
* [Docker][docker] 1.8.1
* Not running any services on ports `80` and `53`

**Important**: If you are running any service on port `80` and/or `53` you must customize the configuration of `azk` setting the following variables `AZK_BALANCER_PORT` and `AZK_DNS_PORT` respectively, before running `azk agent start`.

## Ubuntu Precise (12.04), Trusty (14.04) and Wily (15.04) (all 64-bit)

1. Install Docker:

  - Install **Docker's latest version** [docker-engine][docker_ubuntu_installation] - Docker has a `curl script` for easy installation;
  - Include your local user in the [docker group][docker_ubuntu_root_access]; Logoff for user group settings to take effect;
  - [Disable the use of dnsmasq][docker_ubuntu_dns];
  - Stop dnsmasq and ensure it won't start at login:

    ``` bash
    $ sudo service dnsmasq stop
    $ sudo update-rc.d -f dnsmasq remove
    ```

2. Add the Azuki keys to your local keychain:

  ```bash
  $ sudo apt-key adv --keyserver keys.gnupg.net \
    --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
  ```

3. Add the Azuki repository to the apt sources list:

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

4. Update the list of packages and install azk:

  ```bash
  $ sudo apt-get update
  $ sudo apt-get install azk
  ```

5. You can [start the azk agent](../getting-started/starting-agent.md) now, but, **make sure that the Docker service is running**;

## Fedora 20, 21, 22 e 23

1. Add the Azuki keys to your local keychain:

  ```bash
  $ rpm --import \
    'http://repo.azukiapp.com/keys/azuki.asc'
  ```

2. Add the Azuki repository:

  ```bash
  # Fedora 20, 21 e 22
  $ echo "[azuki]
  name=azk
  baseurl=http://repo.azukiapp.com/fedora20
  enabled=1
  gpgcheck=1
  " > /etc/yum.repos.d/azuki.repo

  # Fedora 23
  $ echo "[azuki]
  name=azk
  baseurl=http://repo.azukiapp.com/fedora23
  enabled=1
  gpgcheck=1
  " > /etc/yum.repos.d/azuki.repo
  ```

3. Install `azk` and its dependencies:

  ```bash
  $ sudo yum install azk
  ```

4. Include your local user in the [docker group][docker_fedora_root_access]; Logoff for user group settings to take effect;

5. You can [start the azk agent](../getting-started/starting-agent.md) now, but, **make sure that the Docker service is running**;


## Other distributions

Coming soon...

!INCLUDE "../getting-started/banner.md"
!INCLUDE "../../links.md"
