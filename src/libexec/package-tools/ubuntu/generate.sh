#! /bin/bash

if [[ $# < 3 ]] || [[ $# > 4 ]]; then
  echo "Usage: ${0##*/} {secret_key} {libnss_resolver_version} {distro} [--clean_repo]"
  exit 1
fi

if [[ $# == 4 ]] && [[ "$4" == "--clean_repo" ]]; then
  CLEAN_REPO=true
fi

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

export AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../../../..; pwd`
cd $AZK_ROOT_PATH

if [[ ! -e ./bin/azk ]]; then
    echo "$AZK_ROOT_PATH is not azk project root"
    exit 2
fi

set -e

export PATH=`pwd`/bin:$PATH
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

export VERSION=$( azk version | sed -e 's/^azk //; s/^version //; s/,.*//' )
export SECRET_KEY=$1
export LIBNSS_RESOLVER_VERSION=$2
export DISTRO=$3 && export REPO=azk-${DISTRO}

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
