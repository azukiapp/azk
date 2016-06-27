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
  --no-make               Don't run \`make\` before packaging
  --no-linux-clean        Don't clean Linux build files before running first \`make -e package_linux\`
  --clean-repo            Force cleaning repo with previous version. Use it with wisdom!
  --no-agent              Don't run \`azk agent\` for builds (assumes it's running somewhere else)
  --no-test               Don't test generated packages
  --publish, -p           Publish the generated packages after build
  --no-version            Don't create a new commit bumping azk version into package.json (adding release channel and date)
  --no-tag                Don't create git version tag to last commit
  --dry                   Don't run the steps and set -x
  --verbose, -v           Displays more detailed info about each building  and packaging step
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

#Clean environment
unset BUILD_DEB BUILD_RPM BUILD_MAC SECRET_KEY RELEASE_CHANNEL \
      NO_VERSION NO_MAKE NO_CLEAN_LINUX CLEAN_REPO CLEAN_REPO_ARGS \
      NO_AGENT NO_TEST PUBLISH NO_TAG VERBOSE

export AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../../..; pwd`
export AZK_BUILD_TOOLS_PATH=${AZK_ROOT_PATH}/src/libexec/package-tools

export PATH=${AZK_ROOT_PATH}/bin:$PATH

[[ -e .env ]] && source .env

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
    --clean-repo )
      CLEAN_REPO=true
      CLEAN_REPO_ARGS='--clean-repo';;
    --no-agent )
      NO_AGENT=true;;
    --no-test )
      NO_TEST=true;;
    --publish | -p )
      PUBLISH=true;;
    --no-tag )
      NO_TAG=true;;
    --dry )
      DRY_RUNNING=true;;
    --verbose | -v )
      VERBOSE=true;;
    --help | -h )
        usage && exit 0;;
    *) echo >&2 "Invalid option: $opt"; exit 1;;
   esac
done

if [[ ${DRY_RUNNING} == true ]]; then
  set -x
fi

PACKAGE_SUFFIX="-${RELEASE_CHANNEL}"

case $RELEASE_CHANNEL in
  "" | stable )
    AZK_BALANCER_IP=192.168.62.4
    RELEASE_CHANNEL=stable
    PACKAGE_SUFFIX=;;
  rc )
    AZK_BALANCER_IP=192.168.61.4;;
  nightly )
    AZK_BALANCER_IP=192.168.60.4;;
  * ) echo >&2 "Invalid release channel: ${RELEASE_CHANNEL}." && exit 2;;
esac

if [[ -z "${BUILD_DEB}" ]] && [[ -z "${BUILD_RPM}" ]] && [[ -z "${BUILD_MAC}" ]]; then
  BUILD_DEB=true
  BUILD_RPM=true
  BUILD_MAC=true
fi

if [[ ${BUILD_DEB} == true ]] || [[ ${BUILD_RPM} == true ]]; then
  [[ ! -e "${SECRET_KEY}" ]] && echo >&2 "Please inform a valid GPG key." && exit 3
fi

create_package_envs() {
  AZK_LAST_COMMIT_ID=$(git rev-parse HEAD | cut -c 1-7)
  AZK_LAST_COMMIT_DATE=$(git log -1 --format=%cd --date=short)
  (
    echo "export AZK_LAST_COMMIT_ID=${AZK_LAST_COMMIT_ID}"
    echo "export AZK_LAST_COMMIT_DATE=${AZK_LAST_COMMIT_DATE}"
  ) > .package-envs
}

calculate_azk_version() {
  VERSION_NUMBER=$( cat package.json | grep -e "version" | cut -d' ' -f4 | sed -n 's/\"//p' | sed -n 's/\"//p' | sed -n 's/,//p' | sed s/-.*// )

  if [[ $RELEASE_CHANNEL != 'stable' ]]; then
    RELEASE_COUNTER=$(curl -s https://api.github.com/repos/azukiapp/azk/tags | grep 'name' | \
      grep -c "${VERSION_NUMBER}-${RELEASE_CHANNEL}" | awk '{print $1 + 1}' )
    RELEASE_DATE=$( date +%Y%m%d )
    VERSION_SUFFIX_NO_META="${PACKAGE_SUFFIX}.${RELEASE_COUNTER}"
    VERSION_SUFFIX="${VERSION_SUFFIX_NO_META}+${RELEASE_DATE}"
  fi

  VERSION="${VERSION_NUMBER}${VERSION_SUFFIX}"
  VERSION_NO_META="${VERSION_NUMBER}${VERSION_SUFFIX_NO_META}"
}

bump_version() {
  files=( package.json npm-shrinkwrap.json )
  for f in "${files[@]}"; do
    VERSION_LINE_NUMBER=`cat ${f} | grep -n "version" | head -1 | cut -d ":" -f1`
    rm -Rf ${f}r # Avoiding conflicts
    sed -ir "${VERSION_LINE_NUMBER}s/\([[:digit:]]*\.[[:digit:]]*\.[[:digit:]]*\)[^\"]*/\1${VERSION_SUFFIX}/" ${f}
    rm -Rf ${f}r
    git add ${f}
  done
  git commit -m "Bumping version to azk v${VERSION_NO_META}"

  echo "Version bumped to v${VERSION}."
}

make_tag() {
  git tag -a "v${VERSION_NO_META}"
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
  if [[ ${DRY_RUNNING} == true ]]; then
    step_skip "${@}"
    return
  fi

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
  export AZK_DNS_PORT=53

  RESOLVER_FILE_NAME="/etc/resolver/${AZK_NAMESPACE}"
  RESOLVER_FILE_CONTENT="nameserver ${AZK_BALANCER_IP}.${AZK_DNS_PORT}"

  if [ "$(cat ${RESOLVER_FILE_NAME})" != "${RESOLVER_FILE_CONTENT}" ]; then
    echo "${RESOLVER_FILE_CONTENT}" \
      | sudo tee ${RESOLVER_FILE_NAME} \
      > /dev/null 2>&1
  fi

  export AZK_ENV=development
  azk config set terms_of_use.accepted 1 > /dev/null 2>&1

  azk agent stop
  sleep 3

  azk agent start --no-daemon > $AZK_AGENT_LOG_FILE 2>&1 &
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

linux_generate() {
  mount=${SECRET_KEY}:/root/key.asc
  script="src/libexec/package-tools/${1}/generate.sh"; shift
  azk shell package --mount=${mount} -- ${script} /root/key.asc "${@}"
}

# Go to azk path
cd $AZK_ROOT_PATH
source .dependencies

LINUX_BUILD_WAS_EXECUTED=false

calculate_azk_version

step_run "Creating .package-env file" --exit create_package_envs
[[ $NO_VERSION != true ]] && step_run "Bumping version" --exit bump_version
[[ $NO_MAKE != true ]]    && step_run "Running make" --exit run_make
[[ $NO_AGENT != true ]]   && step_run "Starting agent" --exit start_agent
[[ $NO_TEST != true ]]    && step_run "Preparing testing env" setup_test && TEST_ARGS=$TEST_DIR

LIBNSS_RESOLVER_REPO="https://github.com/azukiapp/libnss-resolver/releases/download/v${LIBNSS_RESOLVER_VERSION}"

SUCCESS_BUILD=true

if [[ $BUILD_DEB == true ]]; then
  SUCCESS_STEP=false
  echo
  echo "Building deb packages"
  echo

  (
    set -e

    if [[ ${CLEAN_REPO} == true ]]; then
      step_run "Cleaning current aptly repo" azk shell --shell=/bin/sh package -c "rm -Rf /azk/aptly/*"
      step_run "Cleaning environment" rm -Rf package/deb package/public
    fi

    EXTRA_FLAGS=""
    if [[ $LINUX_BUILD_WAS_EXECUTED == true || $NO_CLEAN_LINUX == true ]]; then
      EXTRA_FLAGS="LINUX_CLEAN="
    fi

    step_run "Creating deb packages" --exit \
    azk shell package -- rm -rf /azk/aptly/public/pool/main/a/azk${PACKAGE_SUFFIX}/azk${PACKAGE_SUFFIX}_${VERSION_NUMBER}*_amd64.deb \
    && make package_deb ${EXTRA_FLAGS}

    UBUNTU_VERSIONS=( "ubuntu12:precise" "ubuntu14:trusty" "ubuntu15:wily" "ubuntu16:xenial")
    for UBUNTU_VERSION in "${UBUNTU_VERSIONS[@]}"; do

      UBUNTU_VERSION_NUMBER="${UBUNTU_VERSION%%:*}"
      UBUNTU_VERSION_CODENAME="${UBUNTU_VERSION##*:}"

      step_run "Downloading libnss-resolver for ${UBUNTU_VERSION}" --exit \
      mkdir -p package/deb \
      && wget -q "${LIBNSS_RESOLVER_REPO}/${UBUNTU_VERSION_NUMBER}-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb" -O "package/deb/${UBUNTU_VERSION_CODENAME}-libnss-resolver_${LIBNSS_RESOLVER_VERSION}_amd64.deb"

      step_run "Generating ${UBUNTU_VERSION_NUMBER} repository" \
        linux_generate ubuntu ${LIBNSS_RESOLVER_VERSION} ${UBUNTU_VERSION_CODENAME} ${CLEAN_REPO_ARGS}

      if [[ $NO_TEST != true ]]; then
        step_run "Testing ${UBUNTU_VERSION_NUMBER} repository" \
          ${AZK_BUILD_TOOLS_PATH}/test.sh ${UBUNTU_VERSION_NUMBER} $TEST_ARGS
      fi

    done

    SUCCESS_STEP=true
  ) && LINUX_BUILD_WAS_EXECUTED=true

  if `$SUCCESS_BUILD && $SUCCESS_STEP`; then SUCCESS_BUILD=true; else SUCCESS_BUILD=false; fi
  echo
fi

if [[ $BUILD_RPM == true ]]; then
  SUCCESS_STEP=false
  echo
  echo "Building rpm packages"
  echo

  (
    set -e

    [[ ${CLEAN_REPO} == true ]] && step_run "Cleaning environment" rm -Rf package/rpm package/fedora20 package/fedora23

    step_run "Downloading libnss-resolver" --exit \
    mkdir -p package/rpm \
    && wget "${LIBNSS_RESOLVER_REPO}/fedora20-libnss-resolver-${LIBNSS_RESOLVER_VERSION}-1.x86_64.rpm" -O "package/rpm/fedora20-libnss-resolver-${LIBNSS_RESOLVER_VERSION}-1.x86_64.rpm" \
    && wget "${LIBNSS_RESOLVER_REPO}/fedora23-libnss-resolver-${LIBNSS_RESOLVER_VERSION}-1.x86_64.rpm" -O "package/rpm/fedora23-libnss-resolver-${LIBNSS_RESOLVER_VERSION}-1.x86_64.rpm"

    EXTRA_FLAGS=""
    if [[ $LINUX_BUILD_WAS_EXECUTED == true || $NO_CLEAN_LINUX == true ]]; then
      EXTRA_FLAGS="LINUX_CLEAN="
    fi

    step_run "Creating rpm packages" --exit make package_rpm ${EXTRA_FLAGS}

    FEDORA_VERSIONS=( "fedora20" "fedora23" )
    for FEDORA_VERSION in "${FEDORA_VERSIONS[@]}"; do
      step_run "Generating ${FEDORA_VERSION} repository" \
        linux_generate fedora ${FEDORA_VERSION} ${CLEAN_REPO_ARGS}
      if [[ $NO_TEST != true ]]; then
        step_run "Testing ${FEDORA_VERSION} repository" \
          ${AZK_BUILD_TOOLS_PATH}/test.sh ${FEDORA_VERSION} ${TEST_ARGS}
      fi
    done

    SUCCESS_STEP=true
  ) && LINUX_BUILD_WAS_EXECUTED=true

  if `$SUCCESS_BUILD && $SUCCESS_STEP`; then SUCCESS_BUILD=true; else SUCCESS_BUILD=false; fi
  echo
fi

if [[ $BUILD_MAC == true ]]; then
  SUCCESS_STEP=false
  echo
  echo "Building Mac packages"
  echo

  export MAC_REPO_DIR="/usr/local/Library/Taps/azukiapp/homebrew-azk"
  export MAC_REPO_STAGE_BRANCH="stage"

  (
    set -e
    step_run "Cleaning environment" rm -Rf package/brew
    step_run "Creating Mac packages" --exit make package_mac
    step_run "Generating Mac repository" ${AZK_BUILD_TOOLS_PATH}/mac/generate.sh
    if [[ $NO_TEST != true ]]; then
      step_run "Testing Mac repository" ${AZK_BUILD_TOOLS_PATH}/mac/test.sh $TEST_ARGS
    fi
    SUCCESS_STEP=true
  )

  if `$SUCCESS_BUILD && $SUCCESS_STEP`; then SUCCESS_BUILD=true; else SUCCESS_BUILD=false; fi
  echo
fi

step_run "Tearing down" tear_down

[[ $NO_TAG != true ]] && [[ $SUCCESS_BUILD == true ]] && step_run "Tagging to v${VERSION_NO_META}" make_tag

if [[ $PUBLISH == true ]]; then
  if [[ $SUCCESS_BUILD == true ]]; then
    step_run "Publishing generated packages to ${AWS_PACKAGE_BUCKET_STAGE}" azk nvm gulp publish
    cd ${MAC_REPO_DIR}
    step_run "Pushing homebrew formula into ${MAC_REPO_STAGE_BRANCH} branch" git push origin stage
    cd -
    [[ $NO_TAG != true ]] && step_run "Pushing generated git tag" git push origin "v${VERSION_NO_META}"
  else
    echo "Due to some failed step, packages won't be published."
    echo "Check which one has failed, generate it again and then publish."
  fi
fi
