#!/usr/bin/env bash

azk nvm node_modules/gitbook/bin/gitbook.js build content
azk nvm node_modules/gulp/bin/gulp.js del-all-gitbook-folders
azk nvm node_modules/gulp/bin/gulp.js replace-style.css-path-on-index
azk nvm node_modules/gulp/bin/gulp.js deploy
