
AZK_ROOT_PATH:=$(shell pwd)
AZK_LIB_PATH:=${AZK_ROOT_PATH}/lib
AZK_NPM_PATH:=${AZK_LIB_PATH}/node_modules
SO:=$(shell uname -s | awk '{print tolower($$0)}')

NVM_DIR := ${AZK_LIB_PATH}/nvm
NODE_VERSION := $(shell cat ./.nvmrc)

NODE = ${NVM_DIR}/${NODE_VERSION}/bin/node

${NODE}: .nvmrc
	@echo "installing node" && \
		export NVM_DIR=${NVM_DIR} && \
		mkdir -p ${NVM_DIR} && \
		. ./vendor/bin/nvm.sh && \
		nvm install $(NODE_VERSION)

$AZK_NPM_PATH: package.json
	@azk nvm npm install

$AZK_LIB_PATH/azk: ${AZK_ROOT_PATH}/src ${AZK_NPM_PATH}
	@azk nvm grunt traceur

bootstrap: ${NODE} ${AZK_LIB_PATH}/azk

.PHONY: bootstrap
