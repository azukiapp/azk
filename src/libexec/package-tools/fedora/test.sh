#! /bin/bash

if [[ $# != 1 ]]; then
    echo "Usage: ${0##*/} {distro}"
    exit 1
fi

set -x

BASE_DIR=$( echo $( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd ) | sed s#$( pwd )/##g )
export VERSION=$( azk version | awk '{ print $2 }' )
export DISTRO=$1

azk restart package --reprovision

if [[ "$( azk shell pkg-fedora-test --shell=/bin/bash -c "${BASE_DIR}/install.sh ${DISTRO} && azk version" | tail -n1 )" == "azk ${VERSION}" ]]; then
    echo "azk ${VERSION} has been successfully installed."
else
    echo "Failed to install azk ${VERSION}."
    exit 3
fi
