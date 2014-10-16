AZK_ROOT_PATH:=$(shell pwd)
AZK_LIB_PATH:=${AZK_ROOT_PATH}/lib
AZK_NPM_PATH:=${AZK_ROOT_PATH}/node_modules
SO:=$(shell uname -s | awk '{print tolower($$0)}')

NVM_DIR := ${AZK_LIB_PATH}/nvm
NODE_VERSION := $(shell cat ./.nvmrc)

NODE = ${NVM_DIR}/${NODE_VERSION}/bin/node

# default target
all: bootstrap

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
	@rm -Rf ${AZK_LIB_PATH}/..?* ${AZK_LIB_PATH}/.[!.]* ${AZK_LIB_PATH}/*
	@rm -Rf ${AZK_NPM_PATH}/..?* ${AZK_NPM_PATH}/.[!.]* ${AZK_NPM_PATH}/*
	@rm -Rf ${NVM_DIR}/..?* ${NVM_DIR}/.[!.]* ${NVM_DIR}/*

bootstrap: ${AZK_LIB_PATH}/azk

# BUILD
AZK_VERSION:=$(shell cat package.json | grep -e "version" | cut -d' ' -f4 | sed -n 's/\"//p' | sed -n 's/\"//p' | sed -n 's/,//p')
AZK_BUILD_PATH:=${AZK_ROOT_PATH}/build/v${AZK_VERSION}
PATH_USR_LIB_AZK:=${AZK_BUILD_PATH}/usr/lib/azk
PATH_USR_BIN:=${AZK_BUILD_PATH}/usr/bin
PATH_NODE_MODULES:=${PATH_USR_LIB_AZK}/node_modules
PATH_AZK_LIB:=${PATH_USR_LIB_AZK}/lib
PATH_AZK_NVM:=${PATH_AZK_LIB}/nvm
NODE_BUILD = ${PATH_AZK_NVM}/${NODE_VERSION}/bin/node

clean_build:
	@echo "task: $@"
	@rm -Rf ${AZK_BUILD_PATH}/..?* ${AZK_BUILD_PATH}/.[!.]* ${AZK_BUILD_PATH}/*

${PATH_AZK_LIB}: ${AZK_ROOT_PATH}/src ${PATH_NODE_MODULES}/.installed
	@echo "task: $@"
	@export AZK_LIB_PATH=${PATH_AZK_LIB} && \
		azk nvm grunt traceur:source

${PATH_NODE_MODULES}/.installed: package.json ${NODE_BUILD}
	@echo "task: $@"
	@mkdir -p ${PATH_NODE_MODULES}
	@(cd ${PATH_USR_LIB_AZK} && \
		export AZK_LIB_PATH=${PATH_AZK_LIB} && \
		${PATH_USR_BIN}/azk nvm npm install --production && \
		touch ${PATH_NODE_MODULES}/.installed )

${NODE_BUILD}:
	@echo "task: $@"
	@export NVM_DIR=${PATH_AZK_NVM} && \
		mkdir -p ${PATH_AZK_NVM} && \
		. ./vendor/bin/nvm.sh && \
		nvm install $(NODE_VERSION)

copy_files:
	@echo "task: $@"
	@mkdir -p ${PATH_USR_LIB_AZK}
	@cp -r bin ${PATH_USR_LIB_AZK}
	@cp -r locales ${PATH_USR_LIB_AZK}
	@cp .nvmrc ${PATH_USR_LIB_AZK}
	@cp CHANGELOG.md ${PATH_USR_LIB_AZK}
	@cp LICENSE ${PATH_USR_LIB_AZK}
	@cp README.md ${PATH_USR_LIB_AZK}
	@cp package.json ${PATH_USR_LIB_AZK}

creating_symbolic_links:
	@echo "task: $@"
	@mkdir -p ${PATH_USR_BIN}
	@ln -sf ../lib/azk/bin/azk ${PATH_USR_BIN}/azk
	@ln -sf ../lib/azk/bin/adocker ${PATH_USR_BIN}/adocker

build: bootstrap copy_files creating_symbolic_links ${PATH_AZK_LIB}

.PHONY: bootstrap clean build clean_build copy_files