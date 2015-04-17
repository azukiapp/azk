#! /bin/bash

if [[ $# != 3 ]]; then
    echo "Usage: ${0##*/} {libnss_resolver_version} {distro} {secret_key}"
    exit 1
fi

if [[ ! -e Azkfile.js ]]; then
    echo "Run this script in the project root"
    exit 2
fi

set -x

export PATH=`pwd`/bin:$PATH
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

export VERSION=$( azk version | awk '{ print $2 }' )
export LIBNSS_RESOLVER_VERSION=$1
export DISTRO=$2 && export REPO=azk-${DISTRO}
export SECRET_KEY=$3

gpg --import $SECRET_KEY

aptly publish drop ${DISTRO}
aptly snapshot drop ${REPO}-${VERSION}
aptly repo drop ${REPO}
aptly repo create -distribution=${DISTRO} -component=main ${REPO}
aptly repo add -force-replace=true ${REPO} package/deb/azk_${VERSION}_amd64.deb package/deb/${DISTRO}-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb
aptly repo show -with-packages ${REPO} | grep "azk_${VERSION}_amd64"
aptly repo show -with-packages ${REPO} | grep "libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64"
aptly snapshot create ${REPO}-${VERSION} from repo ${REPO}
aptly snapshot list | grep "${REPO}-${VERSION}"
aptly publish snapshot ${REPO}-${VERSION}
cp -R /azk/aptly/public package/
