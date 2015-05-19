#!/bin/bash

echo ""
echo "SIMPLE TIME AZK TIME PROFILER"
echo ""

# if sends info to keen-io, sends to dev
export AZK_KEEN_PROJECT_ID=5526968d672e6c5a0d0ebec6
export AZK_KEEN_WRITE_KEY=5dbce13e376070e36eec0c7dd1e7f42e49f39b4db041f208054617863832309c14a797409e12d976630c3a4b479004f26b362506e82a46dd54df0c977a7378da280c05ae733c97abb445f58abb56ae15f561ac9ad774cea12c3ad8628d896c39f6e702f6b035541fc1a562997cb05768
export AZK_DISABLE_TRACKER=false

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
git reset --hard f192daf25d19c7c98b73a82d7a58e81def0e1bac
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
