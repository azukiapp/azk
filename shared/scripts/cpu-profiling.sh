#!/bin/bash


# clean all past profiles
rm -rf CHROME_CPU_PROFILER/

# configure cpu profiler a command
export AZK_ENABLE_CHROME_CPU_PROFILER=1

run() {
  COMMAND=$@

  # profile a command
  echo ""
  echo "# $ \`$COMMAND\`"
  /usr/bin/time -v -o time.verbose ${COMMAND}

  # send files to CHROME_CPU_PROFILER folder
  mkdir -p            "CHROME_CPU_PROFILER/$COMMAND"
  mv CPU*.cpuprofile  "CHROME_CPU_PROFILER/$COMMAND"
  mv time.verbose     "CHROME_CPU_PROFILER/$COMMAND"
}

# get dependency
if [ -d "node_modules/chrome-cpu-profiler" ]
then
  echo "node_modules/chrome-cpu-profiler exists"
else
  git clone https://github.com/saitodisse/chrome-cpu-profiler.git node_modules/chrome-cpu-profiler
  (cd node_modules/chrome-cpu-profiler && npm i)
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
find CHROME_CPU_PROFILER/*
