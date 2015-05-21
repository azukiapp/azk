#!/bin/bash

echo ""
echo "CHROME-CPU-PROFILER"
echo ""

# if sends info to keen-io, sends to dev
export AZK_KEEN_PROJECT_ID=5526968d672e6c5a0d0ebec6
export AZK_KEEN_WRITE_KEY=5dbce13e376070e36eec0c7dd1e7f42e49f39b4db041f208054617863832309c14a797409e12d976630c3a4b479004f26b362506e82a46dd54df0c977a7378da280c05ae733c97abb445f58abb56ae15f561ac9ad774cea12c3ad8628d896c39f6e702f6b035541fc1a562997cb05768
export AZK_DISABLE_TRACKER=false

# this env enable profile
export AZK_ENABLE_CHROME_CPU_PROFILER=1

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
