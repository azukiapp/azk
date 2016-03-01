#! /bin/bash

if [[ $# < 4 ]] || [[ $# > 5 ]]; then
  echo "Usage: ${0##*/} {distro} {codename} {version} {azk_namespace} [--run-test-app]"
  exit 1
fi

export DISTRO=$1; shift
export CODENAME=$1; shift
export VERSION=$1; shift
export AZK_NAMESPACE=$1; shift

[[ -z "${AZK_NAMESPACE}" ]] && export AZK_NAMESPACE='dev.azk.io'

RELEASE_CHANNEL=$( echo "${VERSION}" | sed s/[^\\-]*// | sed s/^\\-// | sed s/\\..*// )
if [[ -z "${RELEASE_CHANNEL}" ]]; then
  PKG_SUFFIX=
else
  PKG_SUFFIX="-${RELEASE_CHANNEL}"
fi

BASE_DIR=$( echo $( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd ) | sed s#$(pwd)/##g )

while [[ $# -gt 0 ]]; do
  opt="$1"; shift
  case "$opt" in
    "--" ) break 2;;
    "--run-test-app" )
      RUN_TEST_APP=true;;
    *) echo >&2 "Invalid option: $@"; exit 2;;
   esac
done

AZK_AGENT_LOG_FILE='/tmp/azk-agent-start.log'

fail() {
  tear_down
  exit $@
}

start_agent() {
  azk config set terms_of_use.accepted 1 > /dev/null 2>&1
  azk agent start --no-daemon > $AZK_AGENT_LOG_FILE 2>&1 &
  AGENT_PID="$!"
  tail -F $AZK_AGENT_LOG_FILE &
  TAIL_PID="$!"
  until tail -1 $AZK_AGENT_LOG_FILE | grep -q 'Agent has been successfully started.'; do
    sleep 2;
    kill -0 ${AGENT_PID} || exit 3;
  done

  kill -9 $TAIL_PID > /dev/null 2>&1
}

setup() {
  set -e
  /usr/local/bin/wrapdocker
  ${BASE_DIR}/${DISTRO}/install.sh ${CODENAME} ${PKG_SUFFIX}
  start_agent

  if [[ $RUN_TEST_APP == true ]]; then
    cd /azk/test
    rm -Rf Azkfile.js .azk/
    azk init
    ls Azkfile.js > /dev/null 2>&1
    azk start --reprovision
  fi
}

run_test() {
  set -e
  DETECTED_VERSION=$( azk version | sed -e 's/^azk //; s/^version //; s/,.*//' )

  if [[ "${DETECTED_VERSION}" != "${VERSION}" ]]; then
    echo "Version check failed."
    echo "Detected: azk ${DETECTED_VERSION}"
    echo "Expected: azk ${VERSION}"
    fail 4
  else
    echo "Version is ok!"
  fi

  if [[ $RUN_TEST_APP = true ]]; then
    TEST_URL=$( azk status --text | tail -1 | awk '{print $3}' | tr -d '[:cntrl:]' | sed "s:\[[0-9;]*[mK]::g" )
    RESULT=$( curl -sI $TEST_URL | head -1 | sed s/\\r//g | tr -d '[:cntrl:]' )
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
  azk agent stop
}

set -e

setup
run_test
tear_down

exit 0
