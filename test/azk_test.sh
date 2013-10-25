#!/bin/sh

. $(dirname $0)/test_helper.sh

echo "Testing azk"

azk --env prod exec -i /bin/bash -c 'oi' -c "oi tudo bem"
