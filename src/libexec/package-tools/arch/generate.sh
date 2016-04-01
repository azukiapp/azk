#! /bin/bash

set -x

trap handle_exit EXIT

handle_exit() {
  if [ -e $SUCCESS ]; then
    echo "Done. Go to ${AUR_REPO_DIR} and push the changes."
  else
    echo "Failed to update AUR package"
  fi
}

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

export AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../../..; pwd`
export PATH=${AZK_ROOT_PATH}/bin:$PATH

export VERSION=${1:-$( azk version | sed -e 's/^azk //; s/^version //; s/,.*//' )}
export AUR_REPO_DIR=${2:-"/tmp/aur-azk"}

RELEASE_CHANNEL=$( echo "${VERSION}" | sed s/[^\\-]*// | sed s/^\\-// | sed s/\\..*// )
if [[ ! -z "${RELEASE_CHANNEL}" ]]; then
  echo "Only stable releases are published on AUR"
  exit 0
fi

TMP_AZK_PKG="/tmp/azk-v${VERSION}.tar.gz"
if wget https://github.com/azukiapp/azk/archive/v${VERSION}.tar.gz -O "$TMP_AZK_PKG"; then
  MD5=$(md5sum "$TMP_AZK_PKG" | awk '{print $1}')
  rm "$TMP_AZK_PKG"
else
  echo "Failed to update AUR package:"
  echo "https://github.com/azukiapp/${VERSION}/archive/v${VERSION}.tar.gz is not available yet."
  exit 3
fi

AUR_REPO_URL="git@github.com:azukiapp/aur-azk.git"
AUR_REMOTE_REPO="ssh://aur@aur.archlinux.org/azk.git"
PKGBUILD_FILE="${AUR_REPO_DIR}/PKGBUILD"

rm -Rf ${AUR_REPO_DIR}
(
  set -e
  git clone ${AUR_REPO_URL} ${AUR_REPO_DIR}
  cd ${AUR_REPO_DIR}
  git remote add aur "${AUR_REMOTE_REPO}"

  sed -i -re "s/pkgver=.*/pkgver=${VERSION}/;s/md5sums=.*/md5sums=('${MD5}')/" "${PKGBUILD_FILE}"

  git add "${PKGBUILD_FILE}"
  git commit -m "Bumping version to azk v${VERSION}."
  SUCCESS=true
)
