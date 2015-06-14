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
  brew unlink azk${CHANNEL_SUFFIX}
  rm -Rf /usr/local/Cellar/azk${CHANNEL_SUFFIX}/${VERSION}
  rm -Rf /Library/Caches/Homebrew/azk*.tar.gz
) || true

TMP_FILE="/tmp/azk${CHANNEL_SUFFIX}.rb"
FORMULA_DIR="/usr/local/Library/Taps/azukiapp/homebrew-azk/Formula"
FORMULA_FILE="azk${CHANNEL_SUFFIX}.rb"
cat $FORMULA_DIR/$FORMULA_FILE | sed "s#url.*#url \"file://${BASE_DIR}/package/brew/azk_${VERSION}.tar.gz\"#" > $TMP_FILE
mv $TMP_FILE $FORMULA_DIR/$FORMULA_FILE

brew unlink azk${CHANNEL_SUFFIX} > /dev/null 2>&1
brew install azukiapp/azk/azk${CHANNEL_SUFFIX}

cd $FORMULA_DIR
git checkout $FORMULA_FILE

if [[ "$( /usr/local/bin/azk version )" == "azk ${VERSION}" ]]; then
    echo "azk ${VERSION} has been successfully installed."
else
    echo "Failed to install azk ${VERSION}."
    exit 3
fi
