#!/bin/bash


# clean all past profiles
rm -rf NJS_TRACER_RESULTS/

# configure cpu profiler a command
export AZK_ENABLE_NJS_TRACE_PROFILER=1

run() {
  COMMAND=$@

  # profile a command
  echo ""
  echo "# $ \`$COMMAND\`"
  ${COMMAND}

  # send files to NJS_TRACER_RESULTS folder
  mkdir -p             "NJS_TRACER_RESULTS/$COMMAND"
  mv trace_result.json "NJS_TRACER_RESULTS/$COMMAND"
}

# get dependency
if [ -d "node_modules/njstrace" ]
then
  echo "node_modules/njstrace exists"
else
  git clone https://github.com/saitodisse/njstrace.git node_modules/njstrace
  (cd node_modules/njstrace && npm i)
fi

# cleanup
azk agent stop
# adocker kill $(adocker ps -q | tr '\r\n' ' ')
# adocker rm -f $(adocker ps -f status=exited -q | tr '\r\n' ' ')

# RUN all commands
run 'azk version'
run 'azk agent start'
run 'azk info'
run 'azk status'
# run 'azk start'
run 'azk agent stop'

echo ""
echo ""
echo "# all profiles generated:"
find NJS_TRACER_RESULTS/*
