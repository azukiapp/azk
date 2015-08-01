#! /bin/bash

if [[ $# < 3 ]] || [[ $# > 4 ]]; then
  echo "Usage: ${0##*/} {libnss_resolver_version} {distro} {secret_key} [--clean_repo]"
  exit 1
fi

if [[ $# == 4 ]] && [[ "$4" == "--clean_repo" ]]; then
  CLEAN_REPO=true
fi

if [[ ! -e Azkfile.js ]]; then
  echo "Run this script in the project root"
  exit 2
fi

set -e

export PATH=`pwd`/bin:$PATH
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

export VERSION=$( azk version | awk '{ print $2 }' )
export LIBNSS_RESOLVER_VERSION=$1
export DISTRO=$2 && export REPO=azk-${DISTRO}
export SECRET_KEY=$3

RELEASE_CHANNEL=$( echo "${VERSION}" | sed s/[^\\-]*// | sed s/^\\-// | sed s/\\..*// )
if [[ -z "${RELEASE_CHANNEL}" ]]; then
  PKG_SUFFIX=
else
  PKG_SUFFIX="-${RELEASE_CHANNEL}"
fi

gpg --import $SECRET_KEY

# Try to remove old publishes
(
  set +e
  aptly publish drop ${DISTRO}
  aptly snapshot drop ${REPO}-${VERSION}
  [[ $CLEAN_REPO == true ]] && aptly repo drop ${REPO}
  ! aptly repo show -with-packages ${REPO} && aptly repo create -distribution=${DISTRO} -component=main ${REPO}
) || true

# Publish a new release
aptly repo add -force-replace=true ${REPO} package/deb/azk*.deb package/deb/${DISTRO}-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb
aptly repo show -with-packages ${REPO} | grep "azk${PKG_SUFFIX}_${VERSION}_amd64"
aptly repo show -with-packages ${REPO} | grep "libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64"
aptly snapshot create ${REPO}-${VERSION} from repo ${REPO}
aptly snapshot list | grep "${REPO}-${VERSION}"
aptly publish snapshot ${REPO}-${VERSION}
cp -R /azk/aptly/public package/
