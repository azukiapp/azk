#! /bin/bash

if [[ $# != 1 ]]; then
    echo "Usage: ${0##*/} {distro}"
    exit 1
fi

export DISTRO=$1

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
yum -y install azk
