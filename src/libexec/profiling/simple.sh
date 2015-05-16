#!/bin/bash

echo ""
echo "SIMPLE TIME AZK TIME PROFILER"
echo ""

# get azk root
PROFILING_DIR=$(dirname $0)
cd $PROFILING_DIR/../../..
AZK_ROOT=$(pwd)

PROFILING_DIR=$AZK_ROOT/src/libexec/profiling
SIMPLE_DIR="$PROFILING_DIR/SIMPLE"

echo " vars:"
echo "  \$AZK_ROOT=$AZK_ROOT"
echo "  \$PROFILING_DIR=$PROFILING_DIR"
echo "  \$SIMPLE_DIR=$SIMPLE_DIR"
echo ""

echo "# Removing $SIMPLE_DIR"
rm -rf $SIMPLE_DIR

echo "# Creating $SIMPLE_DIR"
mkdir -p $SIMPLE_DIR
echo ""

echo "# Cloning azkdemo..."
git clone https://github.com/azukiapp/azkdemo.git $PROFILING_DIR/azkdemo &> /dev/null
echo ""

run() {

  COMMAND=$@

  # profile a command
  echo ""
  echo "# $ \`$COMMAND\`"
  (cd $PROFILING_DIR/azkdemo && time ${COMMAND}) &> "$SIMPLE_DIR/$COMMAND.time"
  cat "$SIMPLE_DIR/$COMMAND.time" | grep -e "^real"
}

echo "# Running azk with 'time'..."

### cleanup
azk agent stop

### RUN all commands
run 'adocker version'
run 'adocker info'
run 'azk version'
run 'azk agent start'
run 'azk info'
run 'azk init'
run 'azk start'
run 'azk stop'
run 'azk status'
run 'azk agent stop'

echo ""
echo "# all profiles generated:"
find $SIMPLE_DIR


echo ""
echo "# send all infos to keen-io:"
(cd $PROFILING_DIR && azk nvm npm i)
(cd $PROFILING_DIR && azk nvm node send-simple-data.js)
