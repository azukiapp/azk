#!/usr/bin/env bats

load ../../test_helper

image_name="azukiapp/azktcl"
 image_tag="0.0.2"

@test "$test_label run shell command" {
  cmd="ls -l /; echo 'foo bar'; echo \"David\""
  run azk --log=debug shell --image "${image_name}:${image_tag}" --shell /bin/bash -c "${cmd}"
  assert_success
  assert_match "d.*bin"
  assert_match "d.*etc"
  assert_match "^foo bar"
  assert_match "^David"
}

@test "$test_label run shell command with envs" {
  cmd="env"
  run azk --log=debug shell --image "${image_name}:${image_tag}" --shell /bin/bash -c "${cmd}" -e ECHO=TEST --env DATA=OLD
  assert_success
  assert_match "^ECHO=TEST"
  assert_match "^DATA=OLD"
}

@test "$test_label run shell command with --rebuild" {
  cmd="ls -l /; echo 'foo bar'; echo \"David\""
  run azk --log=debug shell --rebuild --image "${image_name}:${image_tag}" --shell /bin/bash -c "${cmd}"
  assert_success
  assert_match "completed download of \`.*${image_name}:${image_tag}.*\`"
  assert_match "^foo bar"
  assert_match "^David"
}
