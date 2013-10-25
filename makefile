
test:
	@cd test; sh ./luajit_test.sh; sh ./azk_test.sh

.PHONY: test
