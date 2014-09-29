
# bootstrap
bootstrap:
	@echo "installing node"
	@azk nvm nvm install `cat .nvmrc`

.PHONY: bootstrap
