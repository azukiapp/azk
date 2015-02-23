# Contributing to azk

1. [Contributing to the project](README.html#contributing-to-the-project)
1. [Questions and support](README.html#questions-and-support)
1. [How to report issues](README.html#how-to-report-issues)
1. [Contributing to the source code](README.html#contributing-to-the-source-code)


## Contributing to the project

`azk` is entirely _Open Source_ and its source code is available in its own [github] repository. We always need help to identify gaps, write tests, solve [issues] and improve the documentation.


## Questions and support

Documentation for `azk`, the one you are reading right now, is the main source of information about the project. There is also a chat ([gitter]) that can be useful to ask questions in real time directly to our team of developers.


## How to report issues

Errors are reported by creating new [issues] on [github]. Please, before creating new [issues] make sure there are no similar ones created previously.


## Contributing to the source code

`azk`'s code is written in [node.js]. It uses several features of ES6 and since they are not yet available in a stable version, the code goes through a _compilation_ step for it to be correctly interpreted by the current version of [node.js]. We use [Google Traceur] which provides many features from ES6 (see: [traceur compat-table]). During the transformation from ES6 code to ES5, we always set the `source-map` to on. This allows the generated code to show errors correctly pointing to the original source code (prior to processing).


### Implementation details

One thing that you'll note as soon as you start diving in `azk`'s code is the use of `promises` with `generators`. This allows our asynchronous code to become more similar to synchronous code, making it easier to read. We used the promises library [Q] that already has support for generators.


### Folders

- `/bin`: azk executables: `adocker` and `azk`
- `/docs`: `azk` documentation, gitbook format
- `/shared`:
    - `Azkfile.js`: `azk` main Azkfile.js. Sets the dns and the balancer.
    - `locales/en-US.js`: All messages and texts displayed by the `azk` cli are here.
    - `templates/Azkfile.mustache.js`: Template of an Azkfile written in mustache
- `/spec`: All `azk` tests
- `/src`: Source code
- `.jscsrc`: Sets the code style pattern
- `.jshintrc`: Sets the JavaScript syntax validation
- `Makefile`: Tasks for version packaging
- `npm-shrinkwrap.json`: Lock version of `package.json`
- `package.json`: All `azk` dependencies


### Code quality and style

We use `.jshintrc` and `.jscsrc` configured with 'esnext` enabled, i.e. with various features of ES6. Check the links below for the best way to set up your editor to integrate these code quality verification tools:

- **jscs**: http://jscs.info/overview.html
- **jshint**: http://jshint.com/install/index.html


### Testing

azk uses [mocha] as the testing framework. [grunt] coordinates the necessary tasks for daily use.

To run azk tests, `azk agent` must be running:

```bash
$ azk agent start
...
azk: Agent has been successfully started.
$ azk nvm grunt test
```

##### All tests including "slow" ones

```bash
$ azk nvm grunt slow_test
```

##### All tests excluding "slow" ones

```bash
$ azk nvm grunt test
```

##### Filtering tests

We can filter the tests to solve specific parts.

```bash
$ azk nvm grunt [test|slow_text] --grep="Azk command init run"
```


### Contributing code

We work with the distributed repository format ([Forking Workflow]). This is the classic format of Github. To further improve the organization and preparation of new versions, we chose to use the ideas of [git flow], described by Jeff Kreeftmeijer in his famous blog post: "Using git-flow to automate your workflow git branching".

An example workflow:

```
$ git clone https://github.com/azukiapp/azk.git
$ git checkout -b feature/feature_name develop
# Make some changes to files
$ git add .
$ git commit -m "[my new feature] Fixing some system tests #9283"
$ git push
# Make pull request from your feature branch to azk's develop branch
```

When contributing to `azk`, make a fork directly on [github]. All contributions are made through _Pull Requests_ to the main repository **`develop`** branch (Note: make sure you select the develop branch when sending a pull request).

##### Branch summary:

- `master`: Current production version

- `develop`: Branch for integration of features that will be part of the next release

- `release/x.x.x`: A specific release where the latest fixes will be made before launching the final version

- `feature/understandable_feature_name`: A _feature_ in development or waiting for integration on developer's personal repository


##### Commits format:

When making a commit, use the following pattern:

`[name of the feature being changed] comments #ISSUE_NUMBER`

- `name of the feature being changed`: Short name, usually the same name used in the branch without underscore
- `commentário`: The commit message itself **Always in English** and starting with gerund
- `#ISSUE_NUMBER`: Numeric identifier of related `issue`

>It helps to query and filter the git history and know where changes came from afterwards.


###### Example:

```
$ git commit -m "[my new feature] Fixing some system tests #9283"
```


[mocha]: http://visionmedia.github.io/mocha/
[grunt]: http://gruntjs.com/
[github]: https://github.com/azukiapp/azk
[issues]: https://github.com/azukiapp/azk/issues
[pull requests]: https://github.com/azukiapp/azk/pulls
[gitter]: https://gitter.im/azukiapp/azk
[git flow]: http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/
[Forking Workflow]: https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow
[Google Traceur]: https://github.com/google/traceur-compiler
[traceur compat-table]: http://kangax.github.io/compat-table/es6/#tr
[node.js]: http://nodejs.org/
[Q]: https://github.com/kriskowal/q/wiki/API-Reference#generators
