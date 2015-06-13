#! /bin/bash

set -x

export VERSION=$( azk version | awk '{ print $2 }' )

BASE_DIR=$( pwd )
SHA256=$(shasum -a 256 shasum -a 256 "package/brew/azk_${VERSION}.tar.gz" | awk '{print $1}')

RELEASE_CHANNEL=$( echo "${VERSION}" | sed s/[^\\-]*// | sed s/^\\-// | sed s/\\..*// )
if [[ -z $RELEASE_CHANNEL ]]; then
  CHANNEL_SUFFIX=
else
  CHANNEL_SUFFIX="-${RELEASE_CHANNEL}"
fi

# Clean same version
(
  set -e
  brew unlink azk
  rm -Rf /usr/local/Cellar/azk${CHANNEL_SUFFIX}/${VERSION}
  rm -Rf /Library/Caches/Homebrew/azk-${VERSION}.tar.gz
) || true

sed -i "s#url.*#url \"file://${BASE_DIR}/package/brew/azk_${VERSION}.tar.gz\"#"

brew unlink azk > /dev/null 2>&1
brew install azukiapp/azk/azk${CHANNEL_SUFFIX}

cd /usr/local/Library/Taps/azukiapp/homebrew-azk/
git checkout Formula/azk${CHANNEL_SUFFIX}.rb

if [[ "$( azk version )" == "azk ${VERSION}" ]]; then
    echo "azk ${VERSION} has been successfully installed."
else
    echo "Failed to install azk ${VERSION}."
    exit 3
fi
