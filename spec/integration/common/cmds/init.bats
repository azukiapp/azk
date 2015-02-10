#!/usr/bin/env bats

load ../../test_helper

msg_not_found='^.*azk.*: Not found a system(s), generating with example system'
msg_generated='^.*azk.*: '"'"'Azkfile.js'"'"' generated'
msg_node='.*`node` system was detected at.*'

@test "$test_label create a $azk_manifest with example system" {
  app_path=$(fixtures_tmp "test-app")
  cd $app_path

  run azk init
  assert_success
  assert_match $msg_not_found "${lines[0]}"
  assert_match $msg_generated "${lines[1]}"

  run azk info
  assert_success
  assert_match ".*example.*:" "${lines[4]}"

  assert [ -e "$app_path/$azk_manifest" ]
}

@test "$test_label create a $azk_manifest with node system" {
  app_path=$(fixtures_tmp "test-app")
  cd $app_path
  echo "{}" > $app_path/package.json

  run azk init
  assert_success
  assert_match $msg_node "${lines[0]}"
  assert_match $msg_generated "${lines[1]}"

  run azk info
  assert_success
  assert_match ".*azktest.*:" "${lines[4]}"

  assert [ -e "$app_path/$azk_manifest" ]
}

@test "$test_label not recreate a $azk_manifest" {
  app_path=$(fixtures_tmp "test-app")
  touch $app_path/$azk_manifest
  cd $app_path

  run azk init
  assert_failure
  assert_match ".*already exists.*" "${lines[0]}"
}

@test "$test_label force to create a $azk_manifest" {
  app_path=$(fixtures_tmp "test-app")
  touch $app_path/$azk_manifest
  cd $app_path

  run azk init
  assert_failure

  run azk init --force
  assert_success
  assert_match $msg_not_found "${lines[0]}"
  assert_match $msg_generated "${lines[1]}"
}
