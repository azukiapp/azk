#!/bin/bash

echo ""
echo "CHROME-CPU-PROFILER"
echo ""

export AZK_ENABLE_CHROME_CPU_PROFILER=1 # this env enable profile

# get azk root
PROFILING_DIR=$(dirname $0)
cd $PROFILING_DIR/../../..
AZK_ROOT=$(pwd)

PROFILING_DIR=$AZK_ROOT/src/libexec/profiling
CHROME_CPU_PROFILER_OUTPUT_DIR="$PROFILING_DIR/CHROME_CPU_PROFILER"
CHROME_CPU_PROFILER_NODE_MODULES="$AZK_ROOT/node_modules/chrome-cpu-profiler"

echo " vars:"
echo "  \$AZK_ROOT=$AZK_ROOT"
echo "  \$PROFILING_DIR=$PROFILING_DIR"
echo "  \$CHROME_CPU_PROFILER_OUTPUT_DIR=$CHROME_CPU_PROFILER_OUTPUT_DIR"
echo "  \$CHROME_CPU_PROFILER_NODE_MODULES=$CHROME_CPU_PROFILER_NODE_MODULES"
echo ""

echo "# Removing $CHROME_CPU_PROFILER_OUTPUT_DIR"
rm -rf $CHROME_CPU_PROFILER_OUTPUT_DIR

echo "# Creating $CHROME_CPU_PROFILER_OUTPUT_DIR"
mkdir -p $CHROME_CPU_PROFILER_OUTPUT_DIR
echo ""

echo "# Cloning chrome-cpu-profiler..."
if [ -d "$CHROME_CPU_PROFILER_NODE_MODULES" ]
then
  echo "$CHROME_CPU_PROFILER_NODE_MODULES already exists"
else
  git clone https://github.com/saitodisse/chrome-cpu-profiler.git $CHROME_CPU_PROFILER_NODE_MODULES
  (cd $CHROME_CPU_PROFILER_NODE_MODULES && npm i)
fi


echo "# Cloning azkdemo..."
git clone https://github.com/azukiapp/azkdemo.git $PROFILING_DIR/azkdemo
echo ""

run() {
  COMMAND=$@

  # profile a command
  echo ""
  echo "# $ \`$COMMAND\`"
  (cd $PROFILING_DIR/azkdemo && ${COMMAND})

  # send files to CHROME_CPU_PROFILER folder
  mv $PROFILING_DIR/azkdemo/CPU*.cpuprofile "$CHROME_CPU_PROFILER_OUTPUT_DIR/$COMMAND.cpuprofile"
}

### cleanup
# run 'azk agent stop'

### RUN all commands
run 'azk version'

# ATTENTION: this others commands showed to not be usefull for CPU profiling
# run 'azk agent start'
# run 'azk info'
# run 'azk init'
# run 'azk start'
# run 'azk stop'
# run 'azk status'
# run 'azk agent stop'

echo ""
echo "# all profiles generated:"
find $PROFILING_DIR/CHROME_CPU_PROFILER
