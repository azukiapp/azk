#! /bin/bash

if [[ $# < 1 ]] || [[ $# > 2 ]]; then
    echo "Usage: ${0##*/} {distro} [test-app-dir]"
    exit 1
fi

set -e

BASE_DIR=$( echo $( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd ) | sed s#$(pwd)/##g )

export VERSION=$( azk version | awk '{ print $2 }' )
export DISTRO=$1

if [[ $# == 2 ]]; then
    export TEST_ARGS="--run-test-app"
    export EXTRA_ARGS="--mount ${2}:/azk/test"
    export EXTRA_CMDS="&& ${BASE_DIR}/test-container.sh"
fi

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

if [[ ! $( azk shell pkg-${UBUNTU_VERSION}-test --shell=/bin/bash ${EXTRA_ARGS} -c "${BASE_DIR}/install.sh ${DISTRO} && ${BASE_DIR}/test-container.sh ${VERSION} ${TEST_ARGS}" ) ]]; then
    echo "Failed to install azk ${VERSION}."
    exit 4
fi
