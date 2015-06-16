#!/usr/bin/env bats

load ../../test_helper

image_name="azukiapp/azktcl"
 image_tag="0.0.2"

@test "$test_label list images" {
  run azk docker images
  assert_success
  assert_match "${image_name}.*${image_tag}"
}

@test "$test_label pass parameters to docker" {
  cmd="ls -l /; echo 'foo bar'; echo \"David\""
  run azk --log=debug docker -- run --rm "${image_name}:${image_tag}" /bin/bash -c "${cmd}"
  assert_success
  assert_match "d.*bin"
  assert_match "d.*etc"
  assert_match "^foo bar"
  assert_match "^David"
}

@test "$test_label move to current directory" {
     image="azkbuildtest:integration"
  app_path=$(spec.fixtures_tmp "build")
  cd $app_path

  run azk docker -- build -t $image .
  assert_success
  assert_match "Step 0 : FROM ${image_name}:${image_tag}"

  run azk docker rmi $image
  assert_success
}
