#!/bin/bash

PKG="libnss-resolver"
URL="https://github.com/azukiapp/libnss-resolver"
DESCRIPTION="Adds Linux support to specify nameservers in a specific domain suffix context"
VERSION=`git describe --abbrev=0 --tags | awk '{ print $gsub(/^v/, "") }'`

LICENSE="Apache 2.0"
VENDOR="Azuki (http://azukiapp.com)"
MAINTAINER="Everton Ribeiro <everton@azukiapp.com>"

usage() {
  echo
  echo "$0 [rpm|deb]"
  echo
  echo "    Uses fpm to build a package"
  echo
  exit 1
}

azk_shell() {
  system="$1"; shift
  set -x
  azk shell $system -c "$@";
  set +x
}

# options

  pkg_type=$1
  fpm_extra_options=""

  case $pkg_type in
    rpm)
      prefix=usr/lib64
      fpm_extra_options=" \
        --rpm-use-file-permissions \
        --rpm-user root --rpm-group root \
      "
      ;;
    deb)
      prefix=usr/lib
      fpm_extra_options=" \
        --deb-user root --deb-group root \
      "
      ;;
    *)
      [ -n "$pkg_type" ] && echo "Package format not supported"
      usage
  esac

  echo "Building $pkg_type for $PKG, $VERSION version..."

# build!

  destdir=build/packages/$(echo "$pkg_type" | tr ' ' '_')

  if [ "$destdir/$prefix" != "/" -a -d "$destdir/$prefix" ] ; then
    rm -rf "$destdir/$prefix"
  fi
  azk_shell build "scons pack -Q pack_prefix=$destdir/$prefix"
  cp -Rf src/samples/* $destdir

# package!

  azk_shell package "fpm \
      -s dir -t ${pkg_type} \
      -n ${PKG} -v ${VERSION} \
      --provides ${PKG}\
      --url \"${URL}\" \
      --description \"${DESCRIPTION}\" \
      --vendor \"${VENDOR}\" \
      --license \"${LICENSE}\" \
      --category \"admin\" \
      --depends 'sed' \
      --depends 'grep' \
      --maintainer \"${MAINTAINER}\" \
      ${fpm_extra_options} \
      --after-install scripts/after-install.sh \
      --after-remove scripts/after-remove.sh \
      -f -C ${destdir} ${prefix} etc \
  "
