
TEST_CMD  := "./bin/luadist exec busted --tags=$(TEST_TAGS)"
RERUN_PATTERN := "{makefile,bin/azk,**/*.bash,**/*.lua,lab/*.lua,**/*.bats,libexec/**/*,spec/**/*azkfile.json}"

test: test-shell test-lua

test-lua:
	@echo "Lua testes"
	@./bin/luadist exec busted

test-shell:
	@echo "Shell tests"
	@bash ./deps/bats/bin/bats ${TEST_FILES}

test-in-agent:
	@echo "Lua testes: Agent"
	@bash ./bin/azk agent exec /bin/bash -c "cd all/`pwd`; ./bin/luadist exec busted"

get-deps:
	@mkdir -p deps
	@./libexec/azk-git https://github.com/sstephenson/bats deps/bats
	@./libexec/azk-git https://github.com/azukiapp/bootstrap deps/bootstrap
	@./libexec/azk-git https://github.com/azukiapp/luadist-git deps/luadist-git
	@./libexec/azk-git https://github.com/azukiapp/luadist-lustache deps/luadist-lustache
	@./libexec/azk-git https://github.com/azukiapp/luadist-ljsyscall deps/luadist-ljsyscall
	@./libexec/azk-git https://github.com/azukiapp/luadist-i18n deps/luadist-i18n
	@./libexec/azk-git https://github.com/azukiapp/lua-pry deps/lua-pry
	@./libexec/azk-git https://github.com/azukiapp/busted deps/busted removing_code
	@./libexec/azk-git https://github.com/azukiapp/luajson deps/luajson
	@./libexec/azk-git https://github.com/nuxlli/lua-linenoise deps/lua-linenoise
	@./libexec/azk-git https://github.com/nuxlli/spfs deps/spfs
	@./libexec/azk-git https://github.com/LuaDist/luasocket deps/luasocket
	@./libexec/azk-git https://github.com/LuaDist/srlua deps/srlua

deps: get-deps
	@./libexec/luadist-bootstrap
	@echo Checking the azk depedencies
	@./bin/luadist install luabitop
	@./bin/luadist install deps/luajson lua-spore
	@./bin/luadist install deps/busted deps/lua-linenoise deps/lua-pry deps/luadist-lustache deps/luadist-i18n deps/luadist-ljsyscall deps/spfs

# auto run test in development
rerun:
	@which rerun &>/dev/null || (echo "Rerun not found, install: gem install rerun" && exit 1)
	@bash -c 'rerun -c --no-growl --pattern $(RERUN_PATTERN) $(TEST_CMD)'

.PHONY: test test-lua test-shell test-in-agent deps
