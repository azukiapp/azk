#!/usr/bin/env bats

load ../../test_helper

@test "$test_label get version" {
  version_line=$(cat $AZK_ROOT_PATH/package.json | grep "version")
  version=$(expr "${version_line}" : '.*version.*"\(.*\)"')

  run azk version
  assert_success
  assert_output "azk $version"
}
