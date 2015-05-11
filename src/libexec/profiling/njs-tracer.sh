#!/bin/bash

BASEDIR=$(dirname $0)

# clean all past profiles
rm -rf "$BASEDIR/NJS_TRACER_RESULTS/"

# configure cpu profiler a command
export AZK_ENABLE_NJS_TRACE_PROFILER=1

makeSymbolicLink() {
  # get dependency
  if [ -d "../njstrace" ]
  then
    echo "../njstrace exists"
    echo "removing from node_modules..."
    rm -rf node_modules/njstrace

    echo "making symbolic link..."
    ln -sf `pwd`/../njstrace node_modules
  else
    echo "../njstrace not found"
  fi
}

clone() {
  # get dependency
  if [ -d "node_modules/njstrace" ]
  then
    echo "node_modules/njstrace exists"
  else
    git clone https://github.com/saitodisse/njstrace.git node_modules/njstrace
    (cd node_modules/njstrace && npm i)
  fi
}

run() {
  COMMAND=$@

  # profile a command
  echo ""
  echo "# $ \`$COMMAND\`"
  ${COMMAND}

  # send files to NJS_TRACER_RESULTS folder
  mkdir -p             "$BASEDIR/NJS_TRACER_RESULTS/$COMMAND"
  mv trace_result.json "$BASEDIR/NJS_TRACER_RESULTS/$COMMAND"
}


makeSymbolicLink
clone

# cleanup
azk agent stop

# RUN all commands
run 'azk version'
run 'azk agent start'
run 'azk info'
run 'azk status'
run 'azk agent stop'
# run 'azk start' #FIXME: do a folder to test azk start

echo ""
echo ""
echo "# all profiles generated:"
find $BASEDIR/NJS_TRACER_RESULTS/*
