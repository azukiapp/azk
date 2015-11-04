# Global vars and configs

SO:=$(shell uname -s | awk '{print tolower($$0)}')
AZK_VERSION:=$(shell cat package.json | grep -e "version" | cut -d' ' -f4 | sed -n 's/\"//p' | sed -n 's/\"//p' | sed -n 's/,//p')

AZK_ROOT_PATH:=$(shell pwd)
AZK_LIB_PATH:=${AZK_ROOT_PATH}/lib
AZK_NPM_PATH:=${AZK_ROOT_PATH}/node_modules
NVM_BIN_PATH:=${AZK_ROOT_PATH}/src/libexec/nvm.sh

AZK_BIN:=${AZK_ROOT_PATH}/bin/azk

# Load dependencies versions
include .dependencies

# default target
all: bootstrap

###### Bootstrap session ######

NVM_DIR := ${AZK_LIB_PATH}/nvm
NVM_NODE_VERSION := $(shell cat ${AZK_ROOT_PATH}/.nvmrc)
NODE = ${NVM_DIR}/${NVM_NODE_VERSION}/bin/node
VM_DISKS_DIR := ${AZK_LIB_PATH}/vm/${AZK_ISO_VERSION}

# Locking npm version
NPM_VERSION_FILE := ${NVM_DIR}/npm_version

finished:
	@echo "Finished!"

clean_nvm_versions: ${NODE}
	@echo "Checking npm version..."
	@if [ ! "$$(${AZK_BIN} nvm npm --version)" = "${NPM_VERSION}" ] ; then \
		rm -f ${NPM_VERSION_FILE}; \
	fi

SRC_JS = $(shell cd ${AZK_ROOT_PATH} && find ./src -name '*.*' -print 2>/dev/null)

teste_envs:
	@echo ${LIBNSS_RESOLVER_VERSION}
	@echo ${AZK_ISO_VERSION}

${AZK_LIB_PATH}/azk: $(SRC_JS) ${NPM_VERSION_FILE} ${AZK_NPM_PATH}/.install
	@echo "task: $@"
	@export AZK_LIB_PATH=${AZK_LIB_PATH} && \
		export AZK_NPM_PATH=${AZK_NPM_PATH} && \
		${AZK_BIN} nvm gulp babel && touch ${AZK_LIB_PATH}/azk

${AZK_NPM_PATH}/.install: npm-shrinkwrap.json package.json
	@echo "task: $@"
	@mkdir -p ${AZK_NPM_PATH}
	@export AZK_LIB_PATH=${AZK_LIB_PATH} && \
		${AZK_BIN} nvm npm install && \
		touch ${AZK_NPM_PATH}/.install

${NPM_VERSION_FILE}:
	@echo "task: install npm ${NPM_VERSION}"
	@rm -Rf ${AZK_NPM_PATH}/*
	@rm -Rf ${AZK_NPM_PATH}/.install
	@touch package.json
	@${AZK_BIN} nvm npm install npm@${NPM_VERSION} -g
	@${AZK_BIN} nvm npm --version > ${NPM_VERSION_FILE}

${NODE}:
	@echo "task: $@: ${NVM_NODE_VERSION}"
	@export NVM_DIR=${NVM_DIR} && \
		mkdir -p ${NVM_DIR} && \
		. ${NVM_BIN_PATH} && \
		nvm install $(NVM_NODE_VERSION)

clean:
	@echo "task: $@"
	@find ${AZK_LIB_PATH} -maxdepth 1 -not -name "lib" | egrep -v '\/vm$$' | xargs rm -Rf
	@rm -Rf ${AZK_NPM_PATH}/..?* ${AZK_NPM_PATH}/.[!.]* ${AZK_NPM_PATH}/*
	@rm -Rf ${NVM_DIR}/..?* ${NVM_DIR}/.[!.]* ${NVM_DIR}/*

bootstrap: clean_nvm_versions ${AZK_LIB_PATH}/azk dependencies finished

dependencies: ${AZK_LIB_PATH}/bats ${VM_DISKS_DIR}/azk.iso ${VM_DISKS_DIR}/azk-agent.vmdk.gz

S3_URL=https://s3-sa-east-1.amazonaws.com/repo.azukiapp.com/vm_disks/${AZK_ISO_VERSION}
${VM_DISKS_DIR}/azk.iso:
	@echo Downloading: ${S3_URL}/azk.iso ...
	@mkdir -p ${VM_DISKS_DIR}
	@curl ${S3_URL}/azk.iso -o ${VM_DISKS_DIR}/azk.iso

${VM_DISKS_DIR}/azk-agent.vmdk.gz:
	@echo Downloading: ${S3_URL}/azk-agent.vmdk.gz ...
	@curl ${S3_URL}/azk-agent.vmdk.gz -o ${VM_DISKS_DIR}/azk-agent.vmdk.gz

${AZK_LIB_PATH}/bats:
	@git clone -b ${BATS_VERSION} https://github.com/sstephenson/bats ${AZK_LIB_PATH}/bats

slow_test: TEST_SLOW="--slow"
slow_test: test
	@echo "task: $@"

test: bootstrap
	@echo "task: $@"
	${AZK_BIN} nvm gulp test ${TEST_SLOW} $(if $(filter undefined,$(origin TEST_GREP)),"",--grep "${TEST_GREP}")

###### Package session ######

AZK_PACKAGE_PATH:=${AZK_ROOT_PATH}/package
AZK_PACKAGE_PREFIX:=${AZK_PACKAGE_PATH}/v${AZK_VERSION}
PATH_USR_LIB_AZK:=${AZK_PACKAGE_PREFIX}/usr/lib/azk
PATH_USR_BIN:=${AZK_PACKAGE_PREFIX}/usr/bin
PATH_NODE_MODULES:=${PATH_USR_LIB_AZK}/node_modules
PATH_AZK_LIB:=${PATH_USR_LIB_AZK}/lib
PATH_AZK_NVM:=${PATH_AZK_LIB}/nvm
NODE_PACKAGE = ${PATH_AZK_NVM}/${NVM_NODE_VERSION}/bin/node
PATH_MAC_PACKAGE:=${AZK_PACKAGE_PATH}/azk_${AZK_VERSION}.tar.gz

# Locking npm version
PACKAGE_NPM_VERSION_FILE := ${PATH_AZK_NVM}/npm_versions

package_clean_nvm_versions: ${NODE_PACKAGE}
	@if [ ! "$$(${AZK_BIN} nvm npm --version)" = "${NPM_VERSION}" ] ; then \
		rm ${PACKAGE_NPM_VERSION_FILE}; \
	fi

# Build package folders tree
package_brew: package_build fix_permissions check_version ${PATH_AZK_LIB}/vm/${AZK_ISO_VERSION} ${PATH_MAC_PACKAGE}
package_mac:
	@export AZK_PACKAGE_PATH=${AZK_PACKAGE_PATH}/brew && \
		mkdir -p $$AZK_PACKAGE_PATH && \
		make -e package_brew

# Alias to create a distro package
LINUX_CLEAN:="--clean"
package_linux: package_build creating_symbolic_links fix_permissions check_version
package_deb:
	@mkdir -p package
	@./src/libexec/package.sh deb ${LINUX_CLEAN}
package_rpm:
	@mkdir -p package
	@./src/libexec/package.sh rpm ${LINUX_CLEAN}

package_clean:
	@echo "task: $@"
	@rm -Rf ${AZK_PACKAGE_PREFIX}/..?* ${AZK_PACKAGE_PREFIX}/.[!.]* ${AZK_PACKAGE_PREFIX}/*

check_version: NEW_AZK_VERSION=$(shell ${PATH_USR_LIB_AZK}/bin/azk version)
check_version:
	@echo "task: $@"
	@if [ ! "azk ${AZK_VERSION}" = "${NEW_AZK_VERSION}" ] ; then \
		echo 'Error to run: ${PATH_USR_LIB_AZK}/bin/azk version'; \
		echo 'Expect: azk ${AZK_VERSION}'; \
		echo 'Output: ${NEW_AZK_VERSION}'; \
		exit 1; \
	fi

${PATH_NODE_MODULES}: ${PACKAGE_NPM_VERSION_FILE} ${PATH_USR_LIB_AZK}/npm-shrinkwrap.json
	@echo "task: $@"
	@cd ${PATH_USR_LIB_AZK} && ${AZK_BIN} nvm npm install --production

${PATH_USR_LIB_AZK}/npm-shrinkwrap.json: ${PATH_USR_LIB_AZK}/package.json
	@echo "task: $@"
	@test -e ${PATH_NODE_MODULES} && rm -rf ${PATH_NODE_MODULES} || true
	@ln -s ${AZK_NPM_PATH} ${PATH_NODE_MODULES}
	@cd ${PATH_USR_LIB_AZK} && ${AZK_BIN} nvm npm shrinkwrap
	@rm ${PATH_NODE_MODULES}

${PACKAGE_NPM_VERSION_FILE}:
	@echo "task: $@"
	@${AZK_BIN} nvm npm install npm@${NPM_VERSION} -g
	@${AZK_BIN} nvm npm --version > ${PACKAGE_NPM_VERSION_FILE}

${NODE_PACKAGE}:
	@echo "task: $@"
	@export NVM_DIR=${PATH_AZK_NVM} && \
		mkdir -p ${PATH_AZK_NVM} && \
		. ${NVM_BIN_PATH} && \
		nvm install $(NVM_NODE_VERSION)

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
FILES_FILTER  = package.json bin shared .nvmrc CHANGELOG.md LICENSE README.md .dependencies
FILES_ALL     = $(shell cd ${AZK_ROOT_PATH} && find $(FILES_FILTER) -print 2>/dev/null | grep -v shared/completions)
FILES_TARGETS = $(foreach file,$(addprefix $(PATH_USR_LIB_AZK)/, $(FILES_ALL)),$(abspath $(file)))
$(foreach file,$(FILES_ALL),$(eval $(call COPY_FILES,$(AZK_ROOT_PATH),$(PATH_USR_LIB_AZK),$(file))))

# Copy transpiled files
copy_transpiled_files:
	@echo "task: $@"
	@mkdir -p ${PATH_AZK_LIB}/azk
	@cp -R $(AZK_LIB_PATH)/azk ${PATH_AZK_LIB}

fix_permissions:
	@chmod 755 ${PATH_USR_LIB_AZK}/bin/*

creating_symbolic_links:
	@echo "task: $@"
	@mkdir -p ${PATH_USR_BIN}
	@ln -sf ../lib/azk/bin/azk ${PATH_USR_BIN}/azk
	@ln -sf ../lib/azk/bin/adocker ${PATH_USR_BIN}/adocker

${PATH_AZK_LIB}/vm/${AZK_ISO_VERSION}: ${AZK_LIB_PATH}/vm
	@mkdir -p ${PATH_AZK_LIB}/vm/${AZK_ISO_VERSION}
	@cp -r ${VM_DISKS_DIR} ${PATH_AZK_LIB}/vm

${PATH_MAC_PACKAGE}: ${AZK_PACKAGE_PREFIX}
	@cd ${PATH_USR_LIB_AZK}/.. && tar -czf ${PATH_MAC_PACKAGE} ./

package_build: bootstrap $(FILES_TARGETS) copy_transpiled_files package_clean_nvm_versions ${PATH_NODE_MODULES}

###### Shell completion session ######

AZK_SHARED_PATH=${AZK_ROOT_PATH}/shared
USAGE_FILE_PATH=${AZK_SHARED_PATH}/locales/usage-en-US.txt

COMPLETIONS_PATH=${AZK_SHARED_PATH}/completions
BASH_COMPLETION_FILE=${COMPLETIONS_PATH}/azk.sh
ZSH_COMPLETION_FILE=${COMPLETIONS_PATH}/_azk

DOCOPT_COMPLETION_VERSION=0.2.6

${BASH_COMPLETION_FILE} ${ZSH_COMPLETION_FILE}: ${USAGE_FILE_PATH}
	@if ! which docopt-completion > /dev/null 2>&1; then \
		echo "task: install/upgrade docopt-completion"; \
		sudo pip install infi.docopt-completion==${DOCOPT_COMPLETION_VERSION}; \
	fi

	@echo "task: generate shell completion to bash"
	@docopt-completion ${AZK_BIN} --manual-bash &>/dev/null
	@mv -f azk.sh ${COMPLETIONS_PATH}
	@echo "Completion file written to ${BASH_COMPLETION_FILE}"

	@echo "task: generate shell completion to zsh"
	@docopt-completion ${AZK_BIN} --manual-zsh &>/dev/null
	@mv -f _azk ${COMPLETIONS_PATH}
	@echo "Completion file written to ${ZSH_COMPLETION_FILE}"

generate_shell_completion: ${AZK_LIB_PATH}/azk ${BASH_COMPLETION_FILE} ${ZSH_COMPLETION_FILE}

ZSH_COMPLETION_PATHS=~/.oh-my-zsh/completions ~/.oh-my-zsh /usr/share/zsh/*/site-functions /usr/share/zsh/*/functions/Completion /usr/share/zsh/site-functions /usr/share/zsh/functions/Completion
BASH_COMPLETION_PATH=$(wildcard /etc/bash_completion.d)
ZSH_COMPLETION_PATH=$(word 1, $(wildcard $(ZSH_COMPLETION_PATHS)))

COMPLETIONS_FILES=
ifdef BASH_COMPLETION_PATH
	COMPLETIONS_FILES+=${BASH_COMPLETION_PATH}/azk.sh
endif
ifdef ZSH_COMPLETION_PATH
	COMPLETIONS_FILES+=${ZSH_COMPLETION_PATH}/_azk
endif

${BASH_COMPLETION_PATH}/azk.sh: ${BASH_COMPLETION_FILE}
	@echo "task: $@"
	@sudo cp -f ${COMPLETIONS_PATH}/azk.sh $(BASH_COMPLETION_PATH)/
	@echo "Shell completion scripts installed in $(BASH_COMPLETION_PATH)/azk.sh"

${ZSH_COMPLETION_PATH}/_azk: ${ZSH_COMPLETION_FILE}
	@echo "task: $@"
	@if [ $(findstring $(wildcard ~/), ${ZSH_COMPLETION_PATH}) ]; then \
		cp -f ${COMPLETIONS_PATH}/_azk $(ZSH_COMPLETION_PATH)/; \
	else \
		sudo cp -f ${COMPLETIONS_PATH}/_azk $(ZSH_COMPLETION_PATH)/; \
	fi
	@echo "Shell completion scripts installed in $(ZSH_COMPLETION_PATH)/_azk"

install_shell_completion: ${COMPLETIONS_FILES}

# Mark not a file tasks
.PHONY: bootstrap clean package_brew package_mac package_deb package_rpm package_build package_clean copy_transpiled_files fix_permissions creating_symbolic_links dependencies check_version slow_test test generate_shell_completion install_shell_completion
