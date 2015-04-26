#! /bin/bash

if [[ $# < 1 ]]; then
    echo "Usage: ${0##*/} {secret_key} [deb] [rpm] [mac] [--no-make] [--no-agent]"
    exit 1
fi

set -x

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

export AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../../..; pwd`
export AZK_BUILD_TOOLS_PATH=${AZK_ROOT_PATH}/src/libexec/package-tools

export PATH=${AZK_ROOT_PATH}/bin:$PATH
SECRET_KEY=$1; shift

AZK_AGENT_LOG_FILE='/tmp/azk-agent-start.log'

while [[ $# -gt 0 ]]; do
    opt="$1"; shift
    case "$opt" in
        "--" ) break 2;;
        "deb" )
            BUILD_DEB=true;;
        "rpm" )
            BUILD_RPM=true;;
        "mac" )
            BUILD_MAC=true;;
        "--no-make" )
            NO_MAKE=true;;
        "--no-clean-linux" )
            NO_CLEAN_LINUX=true;;
        "--no-agent" )
            NO_AGENT=true;;
        *) echo >&2 "Invalid option: $@"; exit 1;;
   esac
done

if [[ -z $BUILD_DEB ]] && [[ -z $BUILD_RPM ]] && [[ -z $BUILD_MAC ]]; then
    BUILD_DEB=true
    BUILD_RPM=true
    BUILD_MAC=true
fi

quiet() {
    "${@}" > /dev/null 2>&1
}

setup() {
    quiet make clean && quiet make
}

tear_down() {
    [[ $NO_AGENT != true ]] \
      && quiet azk agent stop \
      && quiet rm $AZK_AGENT_LOG_FILE
}

step() { echo $@ | sed -e :a -e 's/^.\{1,72\}$/&./;ta';}

step_done() {
    if [[ $# > 0 ]] && [[ $1 != 0 ]]; then
        echo "[ FAIL ]"
        if [[ $# == 2 ]] && [[ "$2" == "--exit" ]]; then
            exit $1
        else
            return $1
        fi
    else
        echo "[ DONE ]"
    fi
}

step_run() {
    step $1; shift
    STEP_EXIT=""
    if [[ $1 == "--exit" ]]; then
        STEP_EXIT="$1"; shift
    fi
    "${@}"
    step_done $? ${STEP_EXIT}
}

start_agent() {
    quiet azk agent stop
    sleep 3

    AZK_VM_MEMORY=3072 ./bin/azk agent start --no-daemon > $AZK_AGENT_LOG_FILE 2>&1 &
    AGENT_PID="$!"
    tail -f $AZK_AGENT_LOG_FILE &
    TAIL_PID="$!"
    until tail -1 $AZK_AGENT_LOG_FILE | grep -q 'Agent has been successfully started.'; do
      sleep 2;
      kill -0 ${AGENT_PID} || exit 1;
    done

    kill -9 $TAIL_PID
}

# Go to azk path
cd $AZK_ROOT_PATH
source .dependencies

LINUX_BUILD_WAS_EXECUTED=false
[[ $NO_MAKE != true ]] && step_run "Setup" --exit setup
[[ $NO_AGENT != true ]] && step_run "Starting agent" --exit start_agent

azk shell package -c "rm -Rf /azk/aptly/*"
LIBNSS_RESOLVER_REPO="https://github.com/azukiapp/libnss-resolver/releases/download/v${LIBNSS_RESOLVER_VERSION}"

if [[ $BUILD_DEB == true ]]; then
    echo
    echo "Building deb packages"
    echo

    (
      set -e

      step "Downloading libnss-resolver"
      mkdir -p package/deb \
      && wget "${LIBNSS_RESOLVER_REPO}/ubuntu12-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb" -O "package/deb/precise-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb" \
      && wget "${LIBNSS_RESOLVER_REPO}/ubuntu14-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb" -O "package/deb/trusty-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb"
      step_done $?

      EXTRA_FLAGS=""
      if [[ $LINUX_BUILD_WAS_EXECUTED == true || $NO_CLEAN_LINUX == true ]]; then
        EXTRA_FLAGS="LINUX_CLEAN="
      fi

      step_run "Creating deb packages" make package_deb ${EXTRA_FLAGS}

      step_run "Generating Ubuntu 12.04 repository" azk shell package -c "src/libexec/package-tools/ubuntu/generate.sh ${LIBNSS_RESOLVER_VERSION} precise ${SECRET_KEY}"
      step_run "Testing Ubuntu 12.04 repository" ${AZK_BUILD_TOOLS_PATH}/ubuntu/test.sh precise

      step_run "Generating Ubuntu 14.04 repository" azk shell package -c "src/libexec/package-tools/ubuntu/generate.sh ${LIBNSS_RESOLVER_VERSION} trusty ${SECRET_KEY}"
      step_run "Testing Ubuntu 14.04 repository" ${AZK_BUILD_TOOLS_PATH}/ubuntu/test.sh trusty
    ) && LINUX_BUILD_WAS_EXECUTED=true

    echo
fi

if [[ $BUILD_RPM == true ]]; then
    echo
    echo "Building rpm packages"
    echo

    (
      set -e

      step "Downloading libnss-resolver"
      mkdir -p package/rpm \
      && wget "${LIBNSS_RESOLVER_REPO}/fedora20-libnss-resolver-${LIBNSS_RESOLVER_VERSION}-1.x86_64.rpm" -O "package/rpm/fedora20-libnss-resolver-${LIBNSS_RESOLVER_VERSION}-1.x86_64.rpm"
      step_done $?

      EXTRA_FLAGS=""
      if [[ $LINUX_BUILD_WAS_EXECUTED == true || $NO_CLEAN_LINUX == true ]]; then
        EXTRA_FLAGS="LINUX_CLEAN="
      fi

      step_run "Creating rpm packages" make package_rpm ${EXTRA_FLAGS}
      LINUX_BUILD_WAS_EXECUTED=true

      step_run "Generating Fedora 20 repository" azk shell package -c "src/libexec/package-tools/fedora/generate.sh fedora20 ${SECRET_KEY}"
      step_run "Testing Fedora 20 repository" ${AZK_BUILD_TOOLS_PATH}/fedora/test.sh fedora20
    ) && LINUX_BUILD_WAS_EXECUTED=true

    echo
fi

if [[ $BUILD_MAC == true ]]; then
    echo
    echo "Building Mac packages"
    echo

    (
      set -e
      step_run "Creating Mac packages" make package_mac
      step_run "Generating Mac repository" ${AZK_BUILD_TOOLS_PATH}/mac/generate.sh
      step_run "Testing Mac repository" ${AZK_BUILD_TOOLS_PATH}/mac/test.sh
    )

    echo
fi

tear_down
