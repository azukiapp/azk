# Linux

!INCLUDE "warning.md"

## Requirements

* Distributions (tested): Ubuntu 12.04/14.04 and Fedora 20
* [Docker][docker] 1.3.0
* Not running any services on ports `80` and `53` 

**Important**: If you are running any service on port `80` and/or `53` you must customize the configuration of `azk` setting the following variables `AZK_BALANCER_PORT` and `AZK_DNS_PORT` respectively, before running `azk agent start`.

## Ubuntu Trusty 14.04 (LTS) (64-bit)

1. Install Docker:

  - [Install **Docker version 1.3**][docker_ubuntu_14_04];
  - Configure it so your user [has access to Docker][docker_root_access];
  - [Disable the use of dnsmasq][docker_ubuntu_dns];
  - **Make sure that Docker is running**;

2. Add the Azuki keys to your local keychain:

  ```bash
  $ sudo apt-key adv --keyserver keys.gnupg.net \
    --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
  ```

3. Add the Azuki repository to the apt sources list:

  ```bash
  $ echo "deb [arch=amd64] http://repo.azukiapp.com trusty main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list
  ```

4. Update the list of packages and install azk:

  ```bash
  $ sudo apt-get update
  $ sudo apt-get install azk
  ```

## Ubuntu Precise 12.04 (LTS) (64-bit)

1. Install Docker:

  - [Install **Docker version 1.3**][docker_ubuntu_12_04];
  - Configure it so your user [has access to Docker][docker_root_access];
  - **Make sure that Docker is running**;
  
2. Add the Azuki keys to your local keychain:

  ```bash
  $ sudo apt-key adv --keyserver keys.gnupg.net \
    --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
  ```

3. Add the Azuki repository to the apt sources list:

  ```bash
  $ echo "deb [arch=amd64] http://repo.azukiapp.com precise main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list
  ```

4. Update the list of packages and install azk:

  ```bash
  $ sudo apt-get update
  $ sudo apt-get install azk
  ```

## Fedora 20

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

4. Before running `azk agent`:

  - Configure it so your user [has access to Docker][docker_root_access];
  - **Make sure that Docker is running**;

## Other distributions

Coming soon...

!INCLUDE "../getting-started/banner.md"
!INCLUDE "../../links.md"

