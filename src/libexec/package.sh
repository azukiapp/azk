#!/bin/bash

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

export AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../..; pwd`
cd $AZK_ROOT_PATH;

PKG="azk"
URL="https://github.com/azukiapp/azk"
DESCRIPTION="Development environments with agility and automation"
VERSION=${PKG_VERSION:-`cat package.json | grep -e "version" | cut -d' ' -f4 | sed -n 's/\"//p' | sed -n 's/\"//p' | sed -n 's/,//p'`}

LICENSE="Apache 2.0"
VENDOR="Azuki (http://azukiapp.com)"
MAINTAINER="Everton Ribeiro <everton@azukiapp.com>"

usage() {
  echo
  echo "$0 [deb|rpm]"
  echo
  echo "    Uses fpm to build a package"
  echo
  exit 1
}

azk_shell() {
  system="$1"; shift
  set -x
  ${AZK_ROOT_PATH}/bin/azk shell $system --shell=/bin/sh -c "$@";
  set +x
}

# options

  fpm_extra_options=""
  pkg_type="$1"
  PKG="${PKG}"

  case $pkg_type in
    rpm)
      fpm_extra_options=" \
        --depends \"docker-io\" \
        --depends \"libnss-resolver >= 0.2.1\" \
        --rpm-use-file-permissions \
        --rpm-user root --rpm-group root \
      "
      ;;
    deb)
      fpm_extra_options=" \
        --depends \"lxc-docker\" \
        --depends \"libnss-resolver (>= 0.2.1)\" \
        --deb-user root --deb-group root \
      "
      ;;
    *)
      [ -n "$pkg_type" ] && echo "Package format not supported"
      usage
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
      --maintainer \"${MAINTAINER}\" \
      -f -p ${destdir} -C ${sources} usr/bin usr/lib/azk \
  "
# ${prefix} etc
# --after-install scripts/after-install.sh \
# --after-remove scripts/after-remove.sh \
