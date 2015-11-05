#!/bin/bash

set -e

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

export AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../..; pwd`
cd $AZK_ROOT_PATH;

URL="https://github.com/azukiapp/azk"
DESCRIPTION="Development environments with agility and automation"
VERSION=${PKG_VERSION:-`cat package.json | grep -e "version" | cut -d' ' -f4 | sed -n 's/\"//p' | sed -n 's/\"//p' | sed -n 's/,//p'`}
RELEASE_CHANNEL=$( echo "${VERSION}" | sed s/[^\\-]*// | sed s/^\\-// | sed s/\\..*// )
if [[ -z $RELEASE_CHANNEL ]]; then
  PKG_SUFFIX=
else
  PKG_SUFFIX="-${RELEASE_CHANNEL}"
fi
PKG="azk${PKG_SUFFIX}"

LICENSE="Apache 2.0"
VENDOR="Azuki (http://azukiapp.com)"
MAINTAINER="Everton Ribeiro <everton@azukiapp.com>"

source $AZK_ROOT_PATH/.dependencies

usage() {
  echo
  echo "$0 {deb|rpm} [--clean]"
  echo
  echo "    Uses fpm to build a package"
  echo
  exit 1
}

azk_shell() {
  system="$1"; shift
  set -x
  ${AZK_ROOT_PATH}/bin/azk shell --shell=/bin/sh $system -c "$@";
  set +x
}

# options

fpm_extra_options=""
pkg_type="$1"
PKG="${PKG}"

if [[ $# == 2 ]] && [[ $2 == "--clean" ]]; then
  CLEAN=true
fi

# Checking if all required env vars are set
DEPS_VARS=( AZK_DOCKER_MIN_VERSION LIBNSS_RESOLVER_VERSION RSYNC_MIN_VERSION )
for DEP_VAR in ${DEPS_VARS[@]}; do
  eval VALUE=\$$DEP_VAR
  if [ -z $VALUE ]; then
    echo "Env var ${DEP_VAR} is required but not present"
    exit 1
  fi
done

case $pkg_type in
  rpm)
    fpm_extra_options=" \
      --depends \"docker-engine >= ${AZK_DOCKER_MIN_VERSION} or docker >= ${AZK_DOCKER_MIN_VERSION}\" \
      --depends \"libnss-resolver >= ${LIBNSS_RESOLVER_VERSION}\" \
      --depends \"rsync >= ${RSYNC_MIN_VERSION}\" \
      --depends \"git\" \
      --rpm-use-file-permissions \
      --rpm-user root --rpm-group root \
    "
    ;;
  deb)
    fpm_extra_options=" \
      --depends \"docker-engine (>= ${AZK_DOCKER_MIN_VERSION})\" \
      --depends \"libnss-resolver (>= ${LIBNSS_RESOLVER_VERSION})\" \
      --depends \"rsync (>= ${RSYNC_MIN_VERSION})\" \
      --depends \"git\" \
      --deb-user root --deb-group root \
    "
    ;;
  *)
    [ -n "$pkg_type" ] && echo "Package format not supported"
    usage
esac

case $PKG in
  azk )
    fpm_conflicts="--conflicts azk-rc --conflicts azk-nightly";;
  azk-rc )
    fpm_conflicts="--conflicts azk --conflicts azk-nightly";;
  azk-nightly )
    fpm_conflicts="--conflicts azk --conflicts azk-rc";;
esac

CURRENT_PATH=`pwd`
THIS_FOLDER=${CURRENT_PATH##*/}
# echo "\$CURRENT_PATH = [ $CURRENT_PATH ]"
# echo "\$THIS_FOLDER  = [ $THIS_FOLDER ]"

echo
echo "Building $pkg_type for $PKG, $VERSION version..."
echo

# build!

sources="/azk/build/v${VERSION}/"
prefix="usr"
destdir="/azk/${THIS_FOLDER}/package/${pkg_type}"
mkdir -p package/${pkg_type}

[[ ! -z $CLEAN ]] && azk_shell package "make -e clean && rm -Rf /azk/build/v${VERSION}"

azk_shell package "make -e package_linux"

# package!

azk_shell package "fpm \
    -s dir -t ${pkg_type} \
    -n ${PKG} -v ${VERSION} \
    --provides ${PKG}\
    --provides ${system}-${PKG}\
    --url \"${URL}\" \
    --description \"${DESCRIPTION}\" \
    --vendor \"${VENDOR}\" \
    --license \"${LICENSE}\" \
    --category \"admin\" \
    --depends \"iproute\" \
    ${fpm_extra_options} \
    ${fpm_conflicts} \
    --maintainer \"${MAINTAINER}\" \
    -f -p ${destdir} -C ${sources} usr/bin usr/lib/azk \
"
# ${prefix} etc
# --after-install scripts/after-install.sh \
# --after-remove scripts/after-remove.sh \
