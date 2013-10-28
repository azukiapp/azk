
test: test-local
	@echo "Run remote test"
	@echo "================"
	@ssh azk-agent "cd /vagrant; make test-local"

test-local:
	@echo "Shell tests"
	@sh ./spec/shell/azk_test.sh
	@echo "Lua testes"
	@./bin/busted spec

.PHONY: test test-local
