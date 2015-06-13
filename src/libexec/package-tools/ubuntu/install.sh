#! /bin/bash

if [[ $# < 1 ]] || [[ $# > 2 ]]; then
    echo "Usage: ${0##*/} {distro} [pkg_suffix]"
    exit 1
fi

export PATH=`pwd`/bin:$PATH
DISTRO=$1
[[ $# == 2 ]] && PKG_SUFFIX=$2

apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
echo "deb [arch=amd64] http://package.azk.${AZK_NAMESPACE} ${DISTRO} main" | tee /etc/apt/sources.list.d/azuki.list
apt-get update && apt-get install azk${PKG_SUFFIX} -y