#! /bin/bash

set -x

export VERSION=$( azk version | awk '{ print $2 }' )

alias bazk='/usr/local/bin/azk'

BASE_DIR=$( pwd )
SHA256=$(shasum -a 256 shasum -a 256 "package/brew/azk_${VERSION}.tar.gz" | awk '{print $1}')

AZK_AGENT_LOG_FILE='/tmp/azk-agent-start.log'

start_agent() {
  bazk agent start --no-daemon > $AZK_AGENT_LOG_FILE 2>&1 &
  AGENT_PID="$!"
  tail -F $AZK_AGENT_LOG_FILE &
  TAIL_PID="$!"
  until tail -1 $AZK_AGENT_LOG_FILE | grep -q 'Agent has been successfully started.'; do
    sleep 2;
    kill -0 ${AGENT_PID} || exit 3;
  done

  kill -9 $TAIL_PID > /dev/null 2>&1
}

setup_test() {
  set -e
  start_agent

  if [[ $RUN_TEST_APP == true ]]; then
    cd /azk/test
    rm -Rf Azkfile.js .azk/
    bazk init
    ls Azkfile.js > /dev/null 2>&1
    bazk start --reprovision
  fi
}

run_test() {
  set -e
  DETECTED_VERSION=$( bazk --version )

  if [[ "${DETECTED_VERSION}" != "azk ${VERSION}" ]]; then
    echo "Version check failed."
    echo "Detected: ${DETECTED_VERSION}"
    echo "Expected: azk ${VERSION}"
    fail 4
  else
    echo "Version is ok!"
  fi

  if [[ $RUN_TEST_APP = true ]]; then
    TEST_URL=$( bazk status --text | tail -1 | awk '{print $3}' | sed -r "s:\x1B\[[0-9;]*[mK]::g" )
    RESULT=$( curl -sI $TEST_URL | head -1 | sed s/\\r//g)
    echo "GET ${TEST_URL}"
    echo "${RESULT}"
    if [[ "$RESULT" != "HTTP/1.1 200 OK" ]]; then
      fail 5
    fi
  fi
}

tear_down() {
  if [[ $RUN_TEST_APP == true ]]; then
    azk stop
    rm -Rf Azkfile.js .azk/
  fi
  bazk agent stop
}

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

if [[ "$( bazk version )" == "azk ${VERSION}" ]]; then
  echo "azk ${VERSION} has been successfully installed."
else
  echo "Failed to install azk ${VERSION}."
  exit 3
fi

set -e

setup_test
run_test
tear_down

exit 0