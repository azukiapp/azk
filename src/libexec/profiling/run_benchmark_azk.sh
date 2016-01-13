#!/bin/bash

echo ""
echo "AZK BENCHMARK - COMMANDS TIME PROFILER"
echo ""

# get azk root path
PROFILING_DIR=$(dirname $0)
cd $PROFILING_DIR/../../..
AZK_ROOT=$(pwd)

PROFILING_DIR=$AZK_ROOT/src/libexec/profiling
BENCHMARKS_RESULTS_PATH="$PROFILING_DIR/BENCHMARKS_RESULTS"

echo " vars:"
echo "  \$AZK_ROOT=$AZK_ROOT"
echo "  \$PROFILING_DIR=$PROFILING_DIR"
echo "  \$BENCHMARKS_RESULTS_PATH=$BENCHMARKS_RESULTS_PATH"
echo ""

echo ""
echo "# Removing older benchmark results and azkdemo folder"
rm -rf $BENCHMARKS_RESULTS_PATH
rm -rf $PROFILING_DIR/azkdemo

echo ""
echo "# Creating $BENCHMARKS_RESULTS_PATH"
mkdir -p $BENCHMARKS_RESULTS_PATH
echo ""

echo ""
echo "# Pulling Docker images..."
adocker pull azukiapp/node:4.2.1
adocker pull redis:3.0.6

echo ""
echo "# Cloning azkdemo..."
git clone https://github.com/azukiapp/azkdemo.git $PROFILING_DIR/azkdemo &> /dev/null
(cd $PROFILING_DIR/azkdemo && git checkout 77284ebba8c645904fda53877496d73f8036d4fe)
echo ""

run_azk_command() {

  COMMAND=$@

  # profile a command
  echo ""
  echo "# $ \`$COMMAND\`"
  (cd $PROFILING_DIR/azkdemo && time ${COMMAND}) &> "$BENCHMARKS_RESULTS_PATH/$COMMAND.time"
  cat "$BENCHMARKS_RESULTS_PATH/$COMMAND.time" | grep -e "^real"
}

echo ""
echo "# Running azk with 'time'..."

### cleanup
azk agent stop

### RUN all commands
run_azk_command 'azk version'
run_azk_command 'azk agent start'
run_azk_command 'adocker version'
run_azk_command 'adocker info'
run_azk_command 'azk info'
run_azk_command 'azk init'
run_azk_command 'azk start'
run_azk_command 'azk stop'
run_azk_command 'azk status'
run_azk_command 'azk agent stop'

echo ""
echo "# all profiles generated:"
find $BENCHMARKS_RESULTS_PATH

echo ""
echo "# send all infos to keen-io:"
(cd $PROFILING_DIR && azk nvm npm i)
(cd $PROFILING_DIR && azk nvm node send_benchmark_data_to_keen_io.js)
