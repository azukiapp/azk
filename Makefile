
AZK_ROOT_PATH:=$(shell pwd)
AZK_LIB_PATH:=${AZK_ROOT_PATH}/lib
AZK_NPM_PATH:=${AZK_ROOT_PATH}/node_modules
SO:=$(shell uname -s | awk '{print tolower($$0)}')

NVM_DIR := ${AZK_LIB_PATH}/nvm
NODE_VERSION := $(shell cat ./.nvmrc)

NODE = ${NVM_DIR}/${NODE_VERSION}/bin/node

${AZK_LIB_PATH}/azk: ${AZK_ROOT_PATH}/src ${AZK_NPM_PATH}/.installed
	@echo "task: $@"
	@export AZK_LIB_PATH=${AZK_LIB_PATH} && \
		export AZK_NPM_PATH=${AZK_NPM_PATH} && \
		azk nvm grunt traceur

${AZK_NPM_PATH}/.installed: package.json ${NODE}
	@echo "task: $@"
	@mkdir -p ${AZK_NPM_PATH}
	@export AZK_LIB_PATH=${AZK_LIB_PATH} && \
		azk nvm npm install && \
		touch ${AZK_NPM_PATH}/.installed

${NODE}:
	@echo "task: $@"
	@export NVM_DIR=${NVM_DIR} && \
		mkdir -p ${NVM_DIR} && \
		. ./vendor/bin/nvm.sh && \
		nvm install $(NODE_VERSION)

clean:
	@echo "task: $@"
	@rm -Rf ${AZK_LIB_PATH}/*
	@rm -Rf ${AZK_NPM_PATH}/*
	@rm -Rf ${NVM_DIR}/*

bootstrap: ${AZK_LIB_PATH}/azk

.PHONY: bootstrap clean
