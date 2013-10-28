#!/bin/sh

__FILE__="${0}"
export _AZK_PATH=`cd \`dirname $(readlink ${__FILE__} || echo ${__FILE__} )\`/../..; pwd`
export PATH=$_AZK_PATH/bin:$PATH

testLuajit() {
  version=$(luajit -v | awk '{print $1 $2}')
  assertEquals "LuaJIT2.0.2" $version
}

testAzk() {
  version=$(azk -v | awk '{print $1 $2}')
  assertEquals "Azk0.0.1" $version
}

. $(dirname $0)/shunit2
