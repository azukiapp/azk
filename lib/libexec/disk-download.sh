#!/bin/sh

url="https://s3-sa-east-1.amazonaws.com/azk/with_ubuntu.vmdk.tar.bz"
disk="$1"

set -x

if [ ! -f $disk ]; then
  cd /tmp
  curl $url -o with_ubuntu.vmdk.tar.bz
  tar -zxf with_ubuntu.vmdk.tar.bz
  mv with_ubuntu.vmdk $disk
  rm with_ubuntu.vmdk.tar.bz
fi
