#! /bin/bash

usage() {
  echo "
  Build and pack azk into deb, rpm and brew packages

Usage:
  ${0##*/} [deb] [rpm] [mac] [<options>]

Arguments:
  deb                     Builds a deb package and creates Ubuntu 12.04 and 14.04 repositories
  rpm                     Builds a rpm package and creates Fedora 20 repository
  mac                     Builds a brew package and creates Mac OS X brew formula

Options:
  --gpg-key=<gpg-file>    The GPG private key to sign deb and rpm packages (not required in mac package case)
  --channel=<channel>     Release channel <channel>=(nightly|rc|stable)
  --publish, -p           Publish the generated packages after build
  --no-version            Don't bump version (adding release channel and date)
  --no-make               Don't run \`make\` before packaging
  --no-linux-clean        Don't clean Linux build files before running first \`make -e package_linux\`
  --no-agent              Don't run \`azk agent\` for builds (assumes it's running somewhere else)
  --no-test               Don't test generated packages
  --versbose, -v          Displays more detailed info about each building  and packaging step
  --help, -h              Show this message
"
}

# Check parameters
if [[ $# < 1 ]]; then
  usage
  exit 1
fi

quiet() {
  ( "${@}" ) > /dev/null 2>&1
}

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

export AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../../..; pwd`
export AZK_BUILD_TOOLS_PATH=${AZK_ROOT_PATH}/src/libexec/package-tools

export PATH=${AZK_ROOT_PATH}/bin:$PATH

AZK_AGENT_LOG_FILE='/tmp/azk-agent-start.log'
TEST_DIR='/tmp/azk-test'
TEST_PROJECT='https://github.com/azukiapp/azkdemo.git'

while [[ $# -gt 0 ]]; do
  opt="$1"; shift
  case $opt in
    -- ) break 2;;
    deb )
      BUILD_DEB=true;;
    rpm )
      BUILD_RPM=true;;
    mac )
      BUILD_MAC=true;;
    --gpg-key=* )
      SECRET_KEY="${opt#*=}";;
    --channel=* )
      RELEASE_CHANNEL="${opt#*=}";;
    --no-version )
      NO_VERSION=true;;
    --no-make )
      NO_MAKE=true;;
    --no-linux-clean )
      NO_CLEAN_LINUX=true;;
    --no-agent )
      NO_AGENT=true;;
    --no-test )
      NO_TEST=true;;
    --publish | -p )
      PUBLISH=true;;
    --verbose | -v )
      VERBOSE=true;;
    --help | -h )
        usage && exit 0;;
    *) echo >&2 "Invalid option: $opt"; exit 1;;
   esac
done

[[ -z $RELEASE_CHANNEL ]] && RELEASE_CHANNEL='stable'
VERSION_SUFFIX="-${RELEASE_CHANNEL}"

case $RELEASE_CHANNEL in
  nightly )
    AZK_BALANCER_IP=192.168.60.4;;
  rc )
    AZK_BALANCER_IP=192.168.61.4;;
  stable )
    AZK_BALANCER_IP=192.168.62.4
    VERSION_SUFFIX=;;
  * ) echo >&2 "Invalid release channel: ${RELEASE_CHANNEL}." && exit 2;;
esac

if [[ -z $BUILD_DEB ]] && [[ -z $BUILD_RPM ]] && [[ -z $BUILD_MAC ]]; then
  BUILD_DEB=true
  BUILD_RPM=true
  BUILD_MAC=true
fi

if [[ ! -z $BUILD_DEB ]] || [[! -z $BUILD_RPM ]]; then
  [[ ! -e $SECRET_KEY ]] && echo >&2 "Please inform an valid GPG key." && exit 3
fi

bump_version() {
  if [[ $RELEASE_CHANNEL != 'stable' ]]; then
    VERSION_NUMBER=$( cat package.json | grep -e "version" | cut -d' ' -f4 | sed -n 's/\"//p' | sed -n 's/\"//p' | sed -n 's/,//p' | sed s/-.*// )
    RELEASE_COUNTER=$(curl -s https://api.github.com/repos/azukiapp/azk/tags | grep 'name' | \
      grep -c "${VERSION_NUMBER}-${RELEASE_CHANNEL}" | awk '{print $1 + 1}' )
    RELEASE_DATE=$( date +%Y%m%d )
    VERSION_SUFFIX="${VERSION_SUFFIX}.${RELEASE_COUNTER}+${RELEASE_DATE}"
  fi

  VERSION_LINE_NUMBER=`cat package.json | grep -n "version" | cut -d ":" -f1`
  sed -ir "${VERSION_LINE_NUMBER}s/\([[:digit:]]*\.[[:digit:]]*\.[[:digit:]]*\)[^\"]*/\1${VERSION_SUFFIX}/" package.json
  VERSION=$( cat package.json | grep -e "version" | cut -d' ' -f4 | sed -n 's/\"//p' | sed -n 's/\"//p' | sed -n 's/,//p' )
  echo "Version bumped to v${VERSION}."
}

run_make() {
  make clean && make
}

tear_down() {
  [[ $NO_AGENT != true ]] \
    && azk agent stop \
    && rm $AZK_AGENT_LOG_FILE \
  || return 0
}

step() { echo -n $@ | sed -e :a -e 's/^.\{1,72\}$/&./;ta'; }

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

  if [[ $VERBOSE == true ]]; then
    "${@}"
  else
    quiet "${@}"
  fi

  step_done $? ${STEP_EXIT}
}

step_skip() {
  step $1; shift
  echo "[ SKIP ]"
}

start_agent() {
  export AZK_NAMESPACE="${RELEASE_CHANNEL}.release.azk.io"
  export AZK_BALANCER_HOST=$AZK_NAMESPACE
  export AZK_VM_MEMORY=768

  azk agent stop
  sleep 3

  sudo /usr/bin/create-resolver-file $AZK_BALANCER_HOST $AZK_BALANCER_IP

  ./bin/azk agent start --no-daemon > $AZK_AGENT_LOG_FILE 2>&1 &
  AGENT_PID="$!"
  tail -F $AZK_AGENT_LOG_FILE &
  TAIL_PID="$!"
  until tail -1 $AZK_AGENT_LOG_FILE | grep -q 'Agent has been successfully started.'; do
    sleep 2;
    kill -0 ${AGENT_PID} || exit 1;
  done

  kill -9 $TAIL_PID > /dev/null 2>&1
}

setup_test() {
  rm -Rf $TEST_DIR
  git clone $TEST_PROJECT $TEST_DIR
}

# Go to azk path
cd $AZK_ROOT_PATH
source .dependencies

LINUX_BUILD_WAS_EXECUTED=false
[[ $NO_VERSION != true ]] && step_run "Bumping version" bump_version
[[ $NO_MAKE != true ]]    && step_run "Running make" --exit run_make
[[ $NO_AGENT != true ]]   && step_run "Starting agent" --exit start_agent
[[ $NO_TEST != true ]]    && step_run "Preparing testing env" setup_test && TEST_ARGS=$TEST_DIR


LIBNSS_RESOLVER_REPO="https://github.com/azukiapp/libnss-resolver/releases/download/v${LIBNSS_RESOLVER_VERSION}"

if [[ $BUILD_DEB == true ]]; then
  echo
  echo "Building deb packages"
  echo

  (
    set -e

    step_run "Cleaning current aptly repo" azk shell package -c "rm -Rf /azk/aptly/*"
    step_run "Cleaning environment" rm -Rf package/deb package/public

    step_run "Downloading libnss-resolver" \
    mkdir -p package/deb \
    && wget -q "${LIBNSS_RESOLVER_REPO}/ubuntu12-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb" -O "package/deb/precise-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb" \
    && wget -q "${LIBNSS_RESOLVER_REPO}/ubuntu14-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb" -O "package/deb/trusty-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb"

    EXTRA_FLAGS=""
    if [[ $LINUX_BUILD_WAS_EXECUTED == true || $NO_CLEAN_LINUX == true ]]; then
      EXTRA_FLAGS="LINUX_CLEAN="
    fi

    step_run "Creating deb packages" make package_deb ${EXTRA_FLAGS}

    step_run "Generating Ubuntu 12.04 repository" azk shell package -c "src/libexec/package-tools/ubuntu/generate.sh ${LIBNSS_RESOLVER_VERSION} precise ${SECRET_KEY}"
    if [[ $NO_TEST != true ]]; then
      step_run "Testing Ubuntu 12.04 repository" ${AZK_BUILD_TOOLS_PATH}/test.sh ubuntu12 $TEST_ARGS
    fi

    step_run "Generating Ubuntu 14.04 repository" azk shell package -c "src/libexec/package-tools/ubuntu/generate.sh ${LIBNSS_RESOLVER_VERSION} trusty ${SECRET_KEY}"
    if [[ $NO_TEST != true ]]; then
      step_run "Testing Ubuntu 14.04 repository" ${AZK_BUILD_TOOLS_PATH}/test.sh ubuntu14 $TEST_ARGS
    fi
  ) && LINUX_BUILD_WAS_EXECUTED=true

  echo
fi

if [[ $BUILD_RPM == true ]]; then
  echo
  echo "Building rpm packages"
  echo

  (
    set -e

    step_run "Cleaning environment" rm -Rf package/rpm package/fedora20

    step_run "Downloading libnss-resolver" \
    mkdir -p package/rpm \
    && wget "${LIBNSS_RESOLVER_REPO}/fedora20-libnss-resolver-${LIBNSS_RESOLVER_VERSION}-1.x86_64.rpm" -O "package/rpm/fedora20-libnss-resolver-${LIBNSS_RESOLVER_VERSION}-1.x86_64.rpm"

    EXTRA_FLAGS=""
    if [[ $LINUX_BUILD_WAS_EXECUTED == true || $NO_CLEAN_LINUX == true ]]; then
      EXTRA_FLAGS="LINUX_CLEAN="
    fi

    step_run "Creating rpm packages" make package_rpm ${EXTRA_FLAGS}
    step_run "Generating Fedora 20 repository" azk shell package -c "src/libexec/package-tools/fedora/generate.sh fedora20 ${SECRET_KEY}"
    if [[ $NO_TEST != true ]]; then
      step_skip "Testing Fedora 20 repository" ${AZK_BUILD_TOOLS_PATH}/test.sh fedora20 $TEST_ARGS
    fi
  ) && LINUX_BUILD_WAS_EXECUTED=true

  echo
fi

if [[ $BUILD_MAC == true ]]; then
  echo
  echo "Building Mac packages"
  echo

  (
    set -e
    step_run "Cleaning environment" rm -Rf package/brew
    step_run "Creating Mac packages" make package_mac
    step_run "Generating Mac repository" ${AZK_BUILD_TOOLS_PATH}/mac/generate.sh
    if [[ $NO_TEST != true ]]; then
      step_run "Testing Mac repository" ${AZK_BUILD_TOOLS_PATH}/mac/test.sh $TEST_ARGS
    fi
  )

  echo
fi

step_run "Tearing down" tear_down
