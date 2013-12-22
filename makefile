
TEST_FILES := $(shell find spec -name '*.bats' | xargs)
RERUN_PATTERN := "{Makefile,bin/azk,**/*.bash,**/*.lua,**/*.bats,libexec/**/*,test/**/*azkfile.json}"

test: test-shell test-lua

test-lua:
	@echo "Lua testes"
	@./bin/luadist exec busted

test-shell:
	@echo "Shell tests"
	@bash ./deps/bats/bin/bats ${TEST_FILES}

get-deps:
	mkdir -p deps
	@./libexec/azk-git-deps https://github.com/sstephenson/bats deps/bats
	@./libexec/azk-git-deps https://github.com/azukiapp/bootstrap deps/bootstrap
	@./libexec/azk-git-deps https://github.com/azukiapp/luadist-git deps/luadist-git
	@./libexec/azk-git-deps https://github.com/LuaDist/luasocket deps/luasocket
	@./libexec/azk-git-deps https://github.com/LuaDist/srlua deps/srlua
	@./libexec/azk-git-deps https://github.com/azukiapp/busted deps/busted
	@./libexec/azk-git-deps https://github.com/nuxlli/luafun deps/luafun
	@./libexec/azk-git-deps https://github.com/nuxlli/lua-linenoise deps/lua-linenoise
	@./libexec/azk-git-deps https://github.com/azukiapp/lua-pry deps/lua-pry
	@./libexec/azk-git-deps https://github.com/nuxlli/spfs deps/spfs

deps: get-deps
	@cd deps; BOOTSTRAP_TMP=`pwd`/../tmp BOOTSTRAP_INSTALL=`pwd`/luadist BOOTSTRAP_REPOS=`pwd` ./bootstrap/bootstrap
	@./bin/luadist install deps/busted
	@./bin/luadist install deps/luafun deps/lua-linenoise deps/lua-pry
	make -C deps/spfs

.PHONY: test test-lua test-shell deps
