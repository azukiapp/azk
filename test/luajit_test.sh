#!/bin/sh

. $(dirname $0)/test_helper.sh

echo "Testing luajit"

luajit -v

echo ""
