#! /bin/bash

if [[ $# < 1 ]] || [[ $# > 2 ]]; then
    echo "Usage: ${0##*/} {distro} [pkg_suffix]"
    exit 1
fi

export PATH=`pwd`/bin:$PATH
DISTRO=$1
[[ $# == 2 ]] && PKG_SUFFIX=$2

rm -rf /etc/yum.repos.d/*
rpm --import http://repo.azukiapp.com/keys/azuki.asc
tee /etc/yum.repos.d/azuki.repo <<EOF
[azuki]
name=azk
baseurl=http://package.azk.${AZK_NAMESPACE}/${DISTRO}
enabled=1
gpgcheck=1
EOF
yum -y update
yum -y install azk${PKG_SUFFIX}
