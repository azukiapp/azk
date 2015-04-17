#! /bin/bash

if [[ $# != 1 ]]; then
    echo "Usage: ${0##*/} {distro}"
    exit 1
fi

set -x

BASE_DIR=$( echo $( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd ) | sed s#$(pwd)/##g )

export VERSION=$( azk version | awk '{ print $2 }' )
export DISTRO=$1

case "${DISTRO}" in
    precise )
        export UBUNTU_VERSION="ubuntu12"
        ;;
    trusty )
        export UBUNTU_VERSION="ubuntu14"
        ;;
    * )
        echo "${DISTRO} is not a supported Ubuntu version. Check it and try again."
        exit 3
        ;;
esac

azk restart package --reprovision

if [[ "$( azk shell pkg-${UBUNTU_VERSION}-test --shell=/bin/bash -c "${BASE_DIR}/install.sh ${DISTRO} && azk version" | tail -n1 )" == "azk ${VERSION}" ]]; then
    echo "azk ${VERSION} has been successfully installed."
else
    echo "Failed to install azk ${VERSION}."
    exit 4
fi
