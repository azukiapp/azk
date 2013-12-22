
TEST_FILES := $(shell find spec -name '*.bats' | xargs)
RERUN_PATTERN := "{Makefile,bin/azk,**/*.bash,**/*.lua,**/*.bats,libexec/**/*,test/**/*azkfile.json}"

test: test-shell test-lua

test-lua:
	@echo "Lua testes"
	@./bin/luadist exec busted

test-shell:
	@echo "Shell tests"
	@bash ./deps/bats/bin/bats ${TEST_FILES}

deps:
	mkdir -p deps
	@cd deps; git clone https://github.com/sstephenson/bats; echo
	@cd deps; BOOTSTRAP_TMP=`pwd`/../tmp BOOTSTRAP_INSTALL=`pwd`/luadist BOOTSTRAP_REPOS=`pwd` ./bootstrap/bootstrap
	@./bin/luadist make deps/lua-linenoise deps/lua-pry deps/luafun
	@./bin/luadist install busted
	@./bin/luadist remove busted
	@./bin/luadist make deps/busted

.PHONY: test test-lua test-shell deps
