#!/bin/sh

set -e

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

export AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../..; pwd`
export PATH=$AZK_ROOT_PATH/bin:$PATH

# This test suite is run inside a VM, even when run on Linux
export AZK_USE_VM="true"

# Set VM default values
export AZK_NAMESPACE="build.dev.azk.io"
export AZK_BALANCER_HOST="$AZK_NAMESPACE"
export AZK_BALANCER_IP="192.168.52.4"
export AZK_VM_MEMORY="768"

# Temporary file to redirect azk agent output
export AZK_AGENT_OUTPUT="/tmp/azk-agent-start.log"

# azk TOS must be accepted in order to run any further action
accept_tos() {
  azk config set terms_of_use.accepted 1 > /dev/null 2>&1
}

stop_agent() {
  azk agent stop || true
}

start_agent() {
  azk agent start
}

setup() {
  echo "nameserver ${AZK_BALANCER_IP}.53" \
    | sudo tee /etc/resolver/${AZK_NAMESPACE} \
    > /dev/null 2>&1
  make
  accept_tos
  stop_agent
  start_agent
}

run_tests() {
  azk nvm npm run test:slow
}

teardown() {
  stop_agent
  rm -Rf "${AZK_AGENT_OUTPUT}"
}

main() {
  setup

  run_tests
  exit $?
}

# This trap will ensure agent is stopped before returning exit code
trap teardown EXIT
trap 'exit 1' INT

main
