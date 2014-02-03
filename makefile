REPORTER = nyan

TEST_FILES := $(shell find test -name '*_spec.js' | xargs)

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony \
		--reporter $(REPORTER) \
		--ui tdd \
		${TEST_FILES}

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony \
		--reporter $(REPORTER) \
		--growl \
		--ui tdd \
		--watch \
		${TEST_FILES}

.PHONY: test test-w
