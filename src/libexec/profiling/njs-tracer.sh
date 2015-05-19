#!/bin/bash

echo ""
echo "NJS-TRACER"
echo ""

# if sends info to keen-io, sends to dev
export AZK_KEEN_PROJECT_ID=5526968d672e6c5a0d0ebec6
export AZK_KEEN_WRITE_KEY=5dbce13e376070e36eec0c7dd1e7f42e49f39b4db041f208054617863832309c14a797409e12d976630c3a4b479004f26b362506e82a46dd54df0c977a7378da280c05ae733c97abb445f58abb56ae15f561ac9ad774cea12c3ad8628d896c39f6e702f6b035541fc1a562997cb05768
export AZK_DISABLE_TRACKER=false

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

echo ""
echo ""
echo "# all profiles generated:"
find $BASEDIR/NJS_TRACER_RESULTS/*
