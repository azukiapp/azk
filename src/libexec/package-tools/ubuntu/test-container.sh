#! /bin/bash

if [[ $# < 1 ]] || [[ $# > 2 ]]; then
    echo "Usage: ${0##*/} {version} [--run-test-app]"
    exit 1
fi

export VERSION=$1; shift

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
    azk agent start --no-daemon > $AZK_AGENT_LOG_FILE 2>&1 &
    AGENT_PID="$!"
    tail -f $AZK_AGENT_LOG_FILE &
    TAIL_PID="$!"
    until tail -1 $AZK_AGENT_LOG_FILE | grep -q 'Agent has been successfully started.'; do
      sleep 2;
      kill -0 ${AGENT_PID} || exit 3;
    done

    kill -9 $TAIL_PID
}

setup() {
    set -e
    /usr/local/bin/wrapdocker
    start_agent

    if [[ $RUN_TEST_APP == true ]]; then
        cd /azk/test
        rm Azkfile.js || true
        azk init
        ls Azkfile.js > /dev/null 2>&1
        azk start
    fi
}

test() {
    set -e

    if [[ "$( azk --version | sed s/azk\ /azk\ v/g )" != "azk ${VERSION}" ]]; then
        echo "Version check failed."
        fail 4
    else
        echo "Version is ok!"
    fi

    if [[ $RUN_TEST_APP = true ]]; then
        TEST_URL=$( azk status -t | tail -1 | awk '{print $3}' | sed -r "s:\x1B\[[0-9;]*[mK]::g" )
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
        rm Azkfile.js
    fi
    azk agent stop
}

set -e

setup
test
tear_down

exit 0