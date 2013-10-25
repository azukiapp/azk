#!/bin/sh

__FILE__="${0}"
export _AZK_PATH=`cd \`dirname $(readlink ${__FILE__} || echo ${__FILE__} )\`/..; pwd`
export PATH=$_AZK_PATH/bin:$PATH
