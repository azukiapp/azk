p() {
  echo "$@" | cat -
  return 1000
}

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

# Return a fixture path
spec.fixtures() {
  echo "${AZK_ROOT_PATH}/spec/fixtures/${1}"
}

# Copy a fixture path to a temporari path
# and return this path
spec.fixtures_tmp() {
    mask="azk.test.XXX"
  origin="$(spec.fixtures $1)"

  # Copy as directory
  if [ -d "$origin" ]; then
    path=`mktemp -d -t "$mask"`
    cp -rf $origin/* "$path"
  # or copy a dir
  else
    path=`mktemp -t "$mask"`
    rm $path
    cp $origin "$path"
  fi

  # Return a new path
  echo $path
}
