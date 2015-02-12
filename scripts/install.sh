#!/bin/bash

ROOT_UID=0
LOGGED_USER=$(logname)
HOME_DIR=/home/$LOGGED_USER
AZK_HOME=$HOME_DIR/.azk

main(){
  detect_OS

  install_docker
  install\_azk\_$OS\_$OS_VERSION
  add_user_to_docker_group
}

detect_OS() {

  UNAME="$(uname -a)"
  # arch="$(uname -m)"
  case "$UNAME" in
    Linux\ *) PLATFORM=linux ;;
    Darwin\ *) PLATFORM=darwin ;;
    SunOS\ *) PLATFORM=sunos ;;
    FreeBSD\ *) PLATFORM=freebsd ;;
  esac
  case "$UNAME" in
    *x86_64*) ARCH=x64 ;;
    *i*86*) ARCH=x86 ;;
    *armv6l*) ARCH=arm-pi ;;
  esac

  echo "platform detected: $PLATFORM, $ARCH"

  if [[ $PLATFORM == "linux" ]]; then

    if [[ $ARCH != "x64" ]]; then
      echo "Unsupported architecture. Sorry, your Linux must be x64."
      exit 1;
    fi

    # get os details
    source /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID

    echo "linux detected: $OS, $OS_VERSION"

    if [[ $ID != "ubuntu" && $ID != "fedora" ]]; then
      echo "Unsupported version or Linux distribution detected"
      exit 1;
    fi

    if [ $UID != $ROOT_UID ]; then
      echo "You don't have sufficient privileges to run this script. Use sudo instead."
      exit 1
    fi
  fi

  if [[ $PLATFORM == "darwin" ]]; then
    OS="mac"
    OS_VERSION="osx"
  fi

}

install_docker() {
  echo ""
  echo "**  --------------"
  echo "**  install_docker --"
  echo "**  --------------"
  echo ""

  if hash docker 2>/dev/null; then
    echo ''
    echo 'docker is instaled, skipping docker installation.'
    echo 'to update docker, run command bellow'
    echo '$ curl -sSL https://get.docker.com/ubuntu/ | sudo sh'
    echo ''
  else
    curl -sSL https://get.docker.com/ubuntu/ | sudo sh
    echo "Docker installed."
  fi
}

add_user_to_docker_group() {
  echo ""
  echo "**  ------------------------"
  echo "**  add_user_to_docker_group --"
  echo "**  ------------------------"
  echo ""

  groupadd docker
  gpasswd -a $LOGGED_USER docker
  service docker restart
  echo " ---------------------------------------------"
  echo " Alert: non-sudo acess to docker client has been configured but you should log out and then log in again for these changes to take effect."
  echo " ---------------------------------------------"
}

install_azk_ubuntu() {
  echo ""
  echo "**  -----------------"
  echo "**  install_azk_ubuntu --"
  echo "**  -----------------"
  echo ""

  echo "sudo apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9..."
  sudo apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9  1>/dev/null

  echo "sudo apt-get update..."
  sudo apt-get update 1>/dev/null

  echo ""
  echo "sudo apt-get install azk -y..."
  sudo apt-get install azk -y
}

install_azk_ubuntu_14.04() {
  echo "deb [arch=amd64] http://repo.azukiapp.com trusty main" | sudo tee /etc/apt/sources.list.d/azuki.list
  install_azk_ubuntu
}

install_azk_ubuntu_12.04() {
  echo "deb [arch=amd64] http://repo.azukiapp.com precise main" | sudo tee /etc/apt/sources.list.d/azuki.list
  install_azk_ubuntu
}

install_azk_fedora_20() {
  echo ""
  echo "**  -----------------"
  echo "**  install_azk_fedora_20 --"
  echo "**  -----------------"
  echo ""

  rpm --import 'http://repo.azukiapp.com/keys/azuki.asc'

  echo "[azuki]
name=azk
baseurl=http://repo.azukiapp.com/fedora20
enabled=1
gpgcheck=1
" > /etc/yum.repos.d/azuki.repo

  sudo yum install azk -y
}

install_azk_mac_osx() {
  echo ""
  echo "**  -------------------"
  echo "**  install_azk_mac_osx --"
  echo "**  -------------------"
  echo ""

  brew install caskroom/cask/brew-cask

  brew cask install virtualbox --appdir=/Applications

  brew install azukiapp/azk/azk

}

main
