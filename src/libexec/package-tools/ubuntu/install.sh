#! /bin/bash

if [[ $# != 1 ]]; then
    echo "Usage: ${0##*/} {distro}"
    exit 1
fi

set -x

export PATH=`pwd`/bin:$PATH
export DISTRO=$1

apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
echo "deb [arch=amd64] http://package.azk.dev.azk.io ${DISTRO} main" | tee /etc/apt/sources.list.d/azuki.list
apt-get update && apt-get install azk -y