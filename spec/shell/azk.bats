#!/usr/bin/env bats

load ../test_helper

@test "$test_label call luajit" {
  run luajit -v
  assert_success
  assert_match "LuaJIT [0-9]*.[0-9]*.[0-9]*" "$output"
}

@test "$test_label blank invocation" {
  run azk -v
  assert_success
  assert_match "azk [0-9]*\.[0-9]*\.[0-9]*" "$output"
}
