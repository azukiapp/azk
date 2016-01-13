#!/bin/bash

echo ""
echo "AZK BENCHMARK - COMMANDS TIME PROFILER"
echo ""

# get all paths
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

AZK_ROOT_PATH=`cd \`abs_dir ${BASH_SOURCE:-$0}\`/../../..; pwd`
PROFILING_DIR="$AZK_ROOT_PATH/src/libexec/profiling"
BENCHMARKS_RESULTS_PATH="$PROFILING_DIR/BENCHMARKS_RESULTS"
AZK_BIN="$AZK_ROOT_PATH/bin/azk"
ADOCKER_BIN="$AZK_ROOT_PATH/bin/adocker"

echo " PATHS:"
echo "  \$AZK_ROOT_PATH=$AZK_ROOT_PATH"
echo "  \$PROFILING_DIR=$PROFILING_DIR"
echo "  \$BENCHMARKS_RESULTS_PATH=$BENCHMARKS_RESULTS_PATH"
echo "  \$AZK_BIN=$AZK_BIN"
echo "  \$ADOCKER_BIN=$ADOCKER_BIN"
echo ""

echo ""
echo "# Removing older benchmark results and azkdemo folder"
rm -rf $BENCHMARKS_RESULTS_PATH
rm -rf $PROFILING_DIR/azkdemo

echo ""
echo "# Creating $BENCHMARKS_RESULTS_PATH"
mkdir -p $BENCHMARKS_RESULTS_PATH

echo ""
echo "# Pulling Docker images..."
$ADOCKER_BIN pull azukiapp/node:4.2.1
$ADOCKER_BIN pull redis:3.0.6

echo ""
echo "# Cloning azkdemo..."
git clone https://github.com/azukiapp/azkdemo.git $PROFILING_DIR/azkdemo &> /dev/null
(cd $PROFILING_DIR/azkdemo && git checkout 77284ebba8c645904fda53877496d73f8036d4fe)
echo ""

run_azk_command() {

  COMMAND=$@
  COMMAND_BIN=$(basename $1)
  SECOND_TO_LAST=$2
  FULL_COMMAND="$COMMAND_BIN $SECOND_TO_LAST"

  # profile a command
  echo ""
  echo "# $ \`$FULL_COMMAND\`"
  (cd $PROFILING_DIR/azkdemo && time ${COMMAND}) &> "$BENCHMARKS_RESULTS_PATH/$FULL_COMMAND.time"
  cat "$BENCHMARKS_RESULTS_PATH/$FULL_COMMAND.time" | grep -e "^real"
}

echo ""
echo "# Running azk with 'time'..."

### cleanup
$AZK_BIN agent stop

### RUN all commands
run_azk_command $AZK_BIN version
run_azk_command $AZK_BIN agent start
run_azk_command $ADOCKER_BIN version
run_azk_command $ADOCKER_BIN info
run_azk_command $AZK_BIN info
run_azk_command $AZK_BIN init
run_azk_command $AZK_BIN start
run_azk_command $AZK_BIN stop
run_azk_command $AZK_BIN status
run_azk_command $AZK_BIN agent stop

echo ""
echo "# all profiles generated:"
find $BENCHMARKS_RESULTS_PATH

echo ""
echo "# send all infos to keen-io:"
(cd $PROFILING_DIR && $AZK_BIN nvm npm i)
(cd $PROFILING_DIR && $AZK_BIN nvm node send_benchmark_data_to_keen_io.js)
