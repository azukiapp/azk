
TEST_FILES := $(shell find spec -name '*.bats' | xargs)
RERUN_PATTERN := "{Makefile,bin/azk,**/*.bash,**/*.lua,**/*.bats,libexec/**/*,test/**/*azkfile.json}"

test: test-shell test-lua

test-lua:
	@echo "Lua testes"
	@./bin/luadist exec busted

test-shell:
	@echo "Shell tests"
	@bash ./deps/bats/bin/bats ${TEST_FILES}

test-in-agent:
	@echo "Lua testes: Agent"
	@bash ./bin/azk agent exec /bin/bash -c 'cd azk; ./bin/luadist exec busted'

get-deps:
	@mkdir -p deps
	@./libexec/azk-git-deps https://github.com/sstephenson/bats deps/bats
	@./libexec/azk-git-deps https://github.com/azukiapp/bootstrap deps/bootstrap
	@./libexec/azk-git-deps https://github.com/azukiapp/luadist-git deps/luadist-git
	@./libexec/azk-git-deps https://github.com/azukiapp/luadist-lustache deps/luadist-lustache
	@./libexec/azk-git-deps https://github.com/azukiapp/luadist-ljsyscall deps/luadist-ljsyscall
	@./libexec/azk-git-deps https://github.com/LuaDist/luasocket deps/luasocket
	@./libexec/azk-git-deps https://github.com/LuaDist/srlua deps/srlua
	@./libexec/azk-git-deps https://github.com/azukiapp/busted deps/busted removing_code
	@./libexec/azk-git-deps https://github.com/nuxlli/lua-linenoise deps/lua-linenoise
	@./libexec/azk-git-deps https://github.com/azukiapp/lua-pry deps/lua-pry
	@./libexec/azk-git-deps https://github.com/nuxlli/spfs deps/spfs

deps: get-deps
	@./libexec/luadist-bootstrap
	@echo Checking the azk depedencies
	@./bin/luadist install luabitop
	@./bin/luadist install deps/busted deps/lua-linenoise deps/lua-pry deps/luadist-lustache deps/luadist-ljsyscall deps/spfs

.PHONY: test test-lua test-shell deps
