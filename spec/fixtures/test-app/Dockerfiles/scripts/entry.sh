#!/bin/bash
set -e

if [ "$1" = 'bar' ]; then
  exec echo "foo"
fi

exec "$@"
