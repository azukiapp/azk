
AZK_ROOT_PATH:=$(shell pwd)
AZK_NPM_PATH:=${AZK_ROOT_PATH}
AZK_LIB_PATH:=${AZK_ROOT_PATH}/lib

NVM_DIR := ${AZK_LIB_PATH}/nvm
NODE_VERSION := $(shell cat ./.nvmrc)

NODE = ${NVM_DIR}/${NODE_VERSION}/bin/node
NODE_MODULES = ${AZK_NPM_PATH}/node_modules

${NODE}: .nvmrc
	@echo "installing node"
	@azk nvm bash -c '. ./vendor/bin/nvm.sh; nvm install ${NODE_VERSION}'

${NODE_MODULES}/touch: ${NODE} package.json
	@azk nvm npm install
	@azk nvm touch ${NODE_MODULES}/touch
	@azk nvm grunt traceur

bootstrap: ${NODE_MODULES}/touch

.PHONY: bootstrap
