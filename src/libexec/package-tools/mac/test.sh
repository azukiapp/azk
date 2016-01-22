#! /bin/bash

set -x

export VERSION=$( azk version | awk '{ print $2 }' )

BASE_DIR=$( pwd )
SHA256=$(shasum -a 256 shasum -a 256 "package/brew/azk_${VERSION}.tar.gz" | awk '{print $1}')

AZK_AGENT_LOG_FILE='/tmp/azk-agent-start.log'

[[ $# == 1 ]] && TEST_DIR=$1;

bazk() {
  /usr/local/bin/azk $@
}

setup_test() {
  set -e

  cd $TEST_DIR
  rm -Rf Azkfile.js .azk/
  bazk config set terms_of_use.accepted 1 > /dev/null 2>&1
  bazk init
  ls Azkfile.js > /dev/null 2>&1
  bazk start --reprovision
}

run_test() {
  set -e

  TEST_URL=$( bazk status --text | tail -1 | awk '{print $3}' | tr -d '[:cntrl:]' | sed "s:\[[0-9;]*[mK]::g" )
  RESULT=$( curl -sI $TEST_URL | head -1 | sed s/\\r//g | tr -d '[:cntrl:]' )
  echo "GET ${TEST_URL}"
  echo "${RESULT}"
  if [[ "${RESULT}" != "HTTP/1.1 200 OK" ]]; then
    fail 5
  fi
}

tear_down() {
  azk stop
  rm -Rf Azkfile.js .azk/
}

fail() {
  tear_down
  exit $@
}

RELEASE_CHANNEL=$( echo "${VERSION}" | sed s/[^\\-]*// | sed s/^\\-// | sed s/\\..*// )
if [[ -z "${RELEASE_CHANNEL}" ]]; then
  CHANNEL_SUFFIX=
else
  CHANNEL_SUFFIX="-${RELEASE_CHANNEL}"
fi

# Clean older versions
(
  # Unlink all channels to avoid conflict
  taps=( azk azk-rc azk-nightly )
  for tap in "${taps[@]}"; do
    brew unlink ${tap}
  done
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

if [[ "$( bazk version )" == "azk ${VERSION}" ]]; then
  echo "azk ${VERSION} has been successfully installed."
else
  echo "Failed to install azk ${VERSION}."
  exit 3
fi

if [[ ! -z "${TEST_DIR}" ]]; then
  (
    set -e
    setup_test
    run_test
    tear_down
  )
fi

exit 0
