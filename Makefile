SO:=$(shell uname -s | awk '{print tolower($$0)}')
AZK_VERSION:=$(shell cat package.json | grep -e "version" | cut -d' ' -f4 | sed -n 's/\"//p' | sed -n 's/\"//p' | sed -n 's/,//p')

AZK_ROOT_PATH:=$(shell pwd)
AZK_LIB_PATH:=${AZK_ROOT_PATH}/lib
AZK_NPM_PATH:=${AZK_ROOT_PATH}/node_modules
NVM_BIN_PATH:=${AZK_ROOT_PATH}/src/libexec/nvm.sh

AZK_BIN:=${AZK_ROOT_PATH}/bin/azk

# default target
all: bootstrap

# BOOTSTRAP
NVM_DIR := ${AZK_LIB_PATH}/nvm
NODE_VERSION := $(shell cat ./.nvmrc)
NODE = ${NVM_DIR}/${NODE_VERSION}/bin/node

SRC_JS = $(shell cd ${AZK_ROOT_PATH} && find ./src -name '*.*' -print 2>/dev/null)

${AZK_LIB_PATH}/azk: $(SRC_JS) ${AZK_NPM_PATH}/.install
	@echo "task: $@"
	@export AZK_LIB_PATH=${AZK_LIB_PATH} && \
		export AZK_NPM_PATH=${AZK_NPM_PATH} && \
		${AZK_BIN} nvm grunt newer:traceur && touch ${AZK_LIB_PATH}/azk

${AZK_NPM_PATH}/.install: package.json ${NODE}
	@echo "task: $@"
	@mkdir -p ${AZK_NPM_PATH}
	@export AZK_LIB_PATH=${AZK_LIB_PATH} && \
		${AZK_BIN} nvm npm install && \
		touch ${AZK_NPM_PATH}/.install

${NODE}:
	@echo "task: $@"
	@export NVM_DIR=${NVM_DIR} && \
		mkdir -p ${NVM_DIR} && \
		. ${NVM_BIN_PATH} && \
		nvm install $(NODE_VERSION)

clean:
	@echo "task: $@"
	@rm -Rf ${AZK_LIB_PATH}/..?* ${AZK_LIB_PATH}/.[!.]* ${AZK_LIB_PATH}/*
	@rm -Rf ${AZK_NPM_PATH}/..?* ${AZK_NPM_PATH}/.[!.]* ${AZK_NPM_PATH}/*
	@rm -Rf ${NVM_DIR}/..?* ${NVM_DIR}/.[!.]* ${NVM_DIR}/*

bootstrap: ${AZK_LIB_PATH}/azk

# PACKAGE
AZK_PACKAGE_PATH:=${AZK_ROOT_PATH}/package
AZK_PACKAGE_PREFIX = ${AZK_PACKAGE_PATH}/v${AZK_VERSION}
PATH_USR_LIB_AZK:=${AZK_PACKAGE_PREFIX}/usr/lib/azk
PATH_USR_BIN:=${AZK_PACKAGE_PREFIX}/usr/bin
PATH_NODE_MODULES:=${PATH_USR_LIB_AZK}/node_modules
PATH_AZK_LIB:=${PATH_USR_LIB_AZK}/lib
PATH_AZK_NVM:=${PATH_AZK_LIB}/nvm
NODE_PACKAGE = ${PATH_AZK_NVM}/${NODE_VERSION}/bin/node
PATH_MAC_PACKAGE = ${AZK_PACKAGE_PATH}/brew/azk_${AZK_VERSION}.tar.gz

# Build package folders tree
package_mac: package_build ${PATH_AZK_LIB}/vm ${PATH_MAC_PACKAGE}
package_linux: package_build creating_symbolic_links

# Alias to create a distro package
package_deb:
	@mkdir -p package
	@./src/libexec/package.sh deb
package_rpm:
	@mkdir -p package
	@./src/libexec/package.sh rpm

package_clean:
	@echo "task: $@"
	@rm -Rf ${AZK_PACKAGE_PREFIX}/..?* ${AZK_PACKAGE_PREFIX}/.[!.]* ${AZK_PACKAGE_PREFIX}/*

${PATH_NODE_MODULES}: ${PATH_USR_LIB_AZK}/package.json ${NODE_PACKAGE}
	@echo "task: $@"
	@mkdir -p ${PATH_NODE_MODULES}/..
	@cd ${PATH_USR_LIB_AZK} && ${AZK_BIN} nvm npm install --production

${NODE_PACKAGE}:
	@echo "task: $@"
	@export NVM_DIR=${PATH_AZK_NVM} && \
		mkdir -p ${PATH_AZK_NVM} && \
		. ${NVM_BIN_PATH} && \
		nvm install $(NODE_VERSION)

define COPY_FILES
$(abspath $(2)/$(3)): $(abspath $(1)/$(3))
	@echo "task: copy from $$< to $$@"
	@mkdir -p $$(dir $$@)
	@if [ -d "$$<" ]; then \
		if [ -d "$$@" ]; then \
			touch $$@; \
		else \
		  mkdir -p $$@; \
		fi \
	fi
	@[ -d $$< ] || cp -f $$< $$@
endef

# copy regular files
FILES_FILTER  = package.json bin shared .nvmrc CHANGELOG.md LICENSE README.md
FILES_ALL     = $(shell cd ${AZK_ROOT_PATH} && find $(FILES_FILTER) -print 2>/dev/null)
FILES_TARGETS = $(foreach file,$(addprefix $(PATH_USR_LIB_AZK)/, $(FILES_ALL)),$(abspath $(file)))
$(foreach file,$(FILES_ALL),$(eval $(call COPY_FILES,$(AZK_ROOT_PATH),$(PATH_USR_LIB_AZK),$(file))))

# Copy transpiled files
FILES_JS         = $(shell cd ${AZK_LIB_PATH}/azk 2>/dev/null && find ./ -name '*.*' -print 2>/dev/null)
FILES_JS_TARGETS = $(foreach file,$(addprefix ${PATH_AZK_LIB}/azk/, $(FILES_JS)),$(abspath $(file)))
$(foreach file,$(FILES_JS),$(eval $(call COPY_FILES,$(AZK_LIB_PATH)/azk,$(PATH_AZK_LIB)/azk,$(file))))

# Debug opts
#$(warning $(FILES_JS))
#$(foreach file,$(FILES_ALL),$(warning $(file)))
# $(warning $(abspath $(2)/$(3)): $(abspath $(1)/$(3)))

creating_symbolic_links:
	@echo "task: $@"
	@mkdir -p ${PATH_USR_BIN}
	@ln -sf ../lib/azk/bin/azk ${PATH_USR_BIN}/azk
	@ln -sf ../lib/azk/bin/adocker ${PATH_USR_BIN}/adocker

${PATH_AZK_LIB}/vm: ${AZK_LIB_PATH}/vm
	@cp -r ${AZK_LIB_PATH}/vm ${PATH_AZK_LIB}/vm

${PATH_MAC_PACKAGE}: ${AZK_PACKAGE_PREFIX}
	@cd ${PATH_USR_LIB_AZK}/.. && tar -czf ${PATH_MAC_PACKAGE} ./

package_build: bootstrap ${AZK_LIB_PATH}/azk $(FILES_TARGETS) $(FILES_JS_TARGETS) ${PATH_NODE_MODULES}

.PHONY: bootstrap clean package package_mac package_deb package_rpm package_build package_clean copy_files
