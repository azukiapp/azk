#!/bin/bash
set -e

echo "Run ${BASH_SOURCE:-$0}"
echo "$@"
exec ${@}
