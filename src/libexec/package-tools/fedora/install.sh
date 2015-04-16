#! /bin/bash

if [[ $# != 1 ]]; then
    echo "Usage: ${0##*/} {distro}"
    exit 1
fi

set -x

export PATH=`pwd`/bin:$PATH
export DISTRO=$1

rpm --import http://repo.azukiapp.com/keys/azuki.asc
tee /etc/yum.repos.d/azuki.repo <<EOF
[azuki]
name=azk
baseurl=${PACKAGE_URL}/${DISTRO}
enabled=1
gpgcheck=1
EOF
yum -y update && yum -y install azk