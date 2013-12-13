
test: test-local
	@echo "Run remote test"
	@echo "================"
	@ssh azk-agent "cd /vagrant; make test-local"

test-local:
	@echo "Shell tests"
	@sh ./spec/shell/azk_test.sh
	@echo "Lua testes"
	@./bin/busted spec

deps:
	mkdir -p deps
	@cd deps; BOOTSTRAP_TMP=`pwd`/../tmp BOOTSTRAP_INSTALL=`pwd`/luadist BOOTSTRAP_REPOS=`pwd` ./bootstrap/bootstrap

.PHONY: test test-local deps
