p() {
  echo "$@" | cat -
  return 1000
}

# Get azk root path
abs_dir() {
  cd "${1%/*}"; link=`readlink ${1##*/}`;
  if [ -z "$link" ]; then pwd; else abs_dir $link; fi
}

fixtures() {
  echo "${AZK_ROOT_PATH}/spec/fixtures/${1}"
}

fixtures_tmp() {
  dir=`mktemp -d -t "azk.test.XXX"`
  cp -rf "$(fixtures $1)"/* "$dir"
  echo $dir
}
