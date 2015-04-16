#!/usr/bin/env bats

load ../../test_helper

label=".*azk.*:"
msg_not_found="${label} System(s) not found, generating with example system."
msg_generated="${label} 'Azkfile.js' generated"
msg_node="${label} \[.*\] A \`node\` system was detected at '.*'."

@test "$test_label create a $azk_manifest with example system" {
  app_path=$(spec.fixtures_tmp "test-app")
  cd $app_path

  run azk init
  assert_success
  assert_match  "${msg_not_found}"
  assert_match "${msg_generated}"

  run azk info --quiet
  assert_success
  assert_match ".*example.*:" "${lines[5]}"

  assert [ -e "$app_path/$azk_manifest" ]
}

@test "$test_label create a $azk_manifest with node system" {
  app_path=$(spec.fixtures_tmp "test-app")
  cd $app_path
  echo "{}" > $app_path/package.json

  run azk init
  assert_success
  assert_match "${msg_node}"
  assert_match "${msg_generated}"

  run azk info
  assert_success
  assert_match ".*azktest.*:" "${lines[5]}"

  assert [ -e "$app_path/$azk_manifest" ]
}

@test "$test_label not recreate a $azk_manifest" {
  app_path=$(spec.fixtures_tmp "test-app")
  touch $app_path/$azk_manifest
  cd $app_path

  run azk init
  assert_failure
  assert_match ".*already exists.*"
}

@test "$test_label force to replace a $azk_manifest" {
  app_path=$(spec.fixtures_tmp "test-app")
  touch $app_path/$azk_manifest
  cd $app_path

  run azk init
  assert_failure

  run azk init --force
  assert_success
  assert_match  "${msg_not_found}"
  assert_match "${msg_generated}"
}
