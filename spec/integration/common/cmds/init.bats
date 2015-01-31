#!/usr/bin/env bats

load ../../test_helper

@test "$test_label create a valid Azkfile.js" {
  fixture_path=$(fixtures_tmp "test-app")

  cd $fixture_path
  run azk init
  assert_success
  assert_match '^.*azk.*: Not found a system(s), generating with example system' "${lines[0]}"
  assert_match '^.*azk.*: '"'"'Azkfile.js'"'"' generated' "${lines[1]}"

  run azk info
  assert_success
  assert_match ".*example.*:" "${lines[4]}"
}
