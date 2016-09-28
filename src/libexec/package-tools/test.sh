#! /bin/bash

if [[ $# < 1 ]] || [[ $# > 2 ]]; then
    echo "Usage: ${0##*/} {so} [test-app-dir]"
    echo "  Supported SOs:"
    echo "    - ubuntu12"
    echo "    - ubuntu14"
    echo "    - ubuntu15"
    echo "    - ubuntu16"
    echo "    - fedora20"
    echo "    - fedora23"
    exit 1
fi

set -e

BASE_DIR=$( echo $( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd ) | sed s#$(pwd)/##g )

export VERSION=$( bin/azk version | sed -e 's/^azk //; s/^version //; s/,.*//' )
export SO=$1

if [[ $# == 2 ]]; then
    TEST_ARGS="--run-test-app"
    EXTRA_ARGS="--mount ${2}:/azk/test"
else
    TEST_ARGS=
fi

case "${SO}" in
    ubuntu12 )
        DISTRO='ubuntu'
        CODENAME='precise'
        ;;
    ubuntu14 )
        DISTRO='ubuntu'
        CODENAME='trusty'
        ;;
    ubuntu15 )
        DISTRO='ubuntu'
        CODENAME='wily'
        ;;
    ubuntu16 )
        DISTRO='ubuntu'
        CODENAME='xenial'
        ;;
    fedora20 )
        DISTRO='fedora'
        CODENAME='fedora20'
        ;;
    fedora23 )
        DISTRO='fedora'
        CODENAME='fedora23'
        exit 0 # Skipping for now
        ;;
    * )
        echo "${SO} is not a supported SO. Check it and try again."
        exit 3
        ;;
esac

azk restart package --reprovision

if azk shell --shell=/bin/sh pkg-${SO}-test ${EXTRA_ARGS} -c "${BASE_DIR}/test-container.sh ${DISTRO} ${CODENAME} ${VERSION} ${AZK_NAMESPACE} ${TEST_ARGS}"; then
    echo "azk ${VERSION} has been successfully installed."
else
    echo "Failed to install azk ${VERSION}."
    exit 4
fi
