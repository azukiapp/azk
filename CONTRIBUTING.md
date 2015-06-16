# Contributing to azk

First off, you're awesome! Thanks for taking the time to contribute to `azk`!

There's a bunch of ways to help, and we welcome any and all of them:

1. Opening issues
1. Commenting on open issues
1. Sending PRs
1. Testing PRs
1. Writing tests
1. Writing documentation
1. Fixing typos

Below you can find a few sections with more detailed information. We also recommend taking a look at GitHub's own guide "[Contributing to Open Source on GitHub](https://guides.github.com/activities/contributing-to-open-source/)".


## Sections

1. [Questions and support](README.html#questions-and-support)
1. [Reporting issues](README.html#reporting-issues)
1. [Tips and guidelines](README.html#tips-and-guidelines)
    1. [Folders structure](README.html#folders-structure)
    1. [Implementation details](README.html#implementation-details)
    1. [Code quality and style](README.html#code-quality-and-style)
    1. [Task tool - Gulp](README.html#task-tool---gulp)
1. [Pull Requests](README.html#pull-requests)
    1. [JavaScript and Node.js](README.html#javascript-and-nodejs)
    1. [Contributing code](README.html#contributing-code)
    1. [Branches organization](README.html#branches-organization)
    1. [Conventions](README.html#conventions)
        1. [Branches](README.html#branches)
        1. [Commit message](README.html#commit-message)
    1. [Testing](README.html#testing)
        1. [Integration tests](README.html#integration-tests)
        1. [Filtering tests](README.html#filtering-tests)
    1. [Adding or updating dependencies](README.html#adding-or-updating-dependencies)
    1. [Opening a Pull Request](README.html#opening-a-pull-request)
        1. [Pull Request format](README.html#pull-request-format)


## Questions and support

The documentation for `azk`, the one you are reading right now, is the main source of information about the project. We also have a chat on [Gitter][gitter] in English and Portuguese that can be useful to ask questions in real time, directly to our team of developers or other members of the community.


## Reporting issues

Errors are reported by creating new [issues] on [GitHub][github]. They help us fix bugs that we might have missed in our testing or release process.

Before creating new [issues] please make sure there are no similar ones already created. If you do find one similar, add a :+1: comment to it, and also any information that might be different from the person who first opened the issue, for example: OS, `azk` version, etc.

Ideally, an issue should contain a basic description of your system, a description of the error, and instructions on how to reproduce it. We encourage you to open an issue even if you cannot remember the steps to trigger it again in case it's intermittent.

An example of a good format for an issue:

```
Description of the problem:

`OS`:
`azk version`:

Environment details (VirtualBox, DigitalOcean, etc.):

Steps to Reproduce:
1.
2.
3.

Actual Results:

Expected Results:

Additional info:
```

## Tips and guidelines


### Folders structure

- `/bin`: azk executables: `adocker` and `azk`
- `/docs`: `azk` documentation in Gitbook format
- `/shared`:
    - `Azkfile.js`: `azk` main Azkfile.js. Sets the dns and the balancer.
    - `locales/en-US.js`: All messages and texts displayed by the `azk` cli are here.
    - `templates/Azkfile.mustache.js`: Template of an Azkfile.js written in mustache
- `/spec`: All `azk` tests
- `/src`: Source code
- `.jscsrc`: Sets the code style pattern
- `.jshintrc`: Sets the JavaScript syntax validation
- `Makefile`: Tasks for packaging
- `npm-shrinkwrap.json`: Locks version of `package.json`
- `package.json`: All `azk` dependencies


### Implementation details

`azk`'s code is written in [Node.js][node.js]. It uses several features of ES6 that are not yet available in a stable version, so the code goes through a _compilation_ step for it to be correctly interpreted by the current version of [Node][node.js]. We use [babeljs] for that, which provides many features from ES6 (see: [babeljs compat-table]). During the transpilation process, we always set the `source-map` to on. This allows the generated code to show errors that correctly point to the original source code.

One thing that you'll note as soon as you start diving in `azk`'s code is the use of `promises` with `generators`. This allows our asynchronous code to become more similar to synchronous code, making it easier to read. We use the promises library [bluebird-generators] that supports generators.


### Code quality and style

We use `.jshintrc` and `.jscsrc` configured with `esnext` enabled, i.e. with various features of ES6. Check the links below for the best way to set up your editor to integrate these code quality verification tools:

- **jscs**: http://jscs.info/overview.html
- **jshint**: http://jshint.com/install/index.html

We also use a `.editorconfig` file to help maintain a consistent coding style no matter which editor or IDE you're using. You can learn more about EditorConfig files [here](http://editorconfig.org/), and check how ours is setup [here](https://github.com/azukiapp/azk/blob/master/.editorconfig).


### Task tool - Gulp

For `azk`'s development, we use [gulp] to coordinate the tasks of day-to-day development, such as:

- Transpiling `es5` files to `es6` with [babeljs];
- Checking code quality with `jshint` and `jscs`;
- Running a "watch" command for file modification and performing the tasks above automatically;

You can find the full list of tasks available by running: `azk nvm gulp help`, but the main task you should be aware of and using during development is `azk nvm watch:test:lint`.


## Pull Requests

First of all, grab `azk` from source and build its binary:

```bash
$ git clone https://github.com/azukiapp/azk.git
$ cd azk
$ make clean
$ make
```

Then add the path to your azk binary to your PATH environment variable, or create an alias to it.

There's additional steps that you need to go through if you're installing it on a Mac or a Linux (for example, installing the `libnss-resolver`). Check [this page](../installation/source-code.md) for more detailed instructions.


### JavaScript and Node.js

As mentioned in the "Implementation Details" section, `azk` is written in [Node.js][node.js], and it uses several features of ES6. One thing to note is that, for developing and contributing to `azk`, you don't need to have Node.js installed in your machine.

`azk` has a version of Node.js, which is the same we use to test it and develop it, inside the folder "`./lib/nvm`". It comes already installed and pre-packaged when you grab `azk` from a package manager, or it's installed if you grab it from GitHub and run `make` to build a binary. That means that we can:

1. Make sure that `azk` is being executed and using a Node.js version that we tested.
2. Not require the user to have Node.js installed in its machine, and if they do, not affect their development environment in any way.

During development, in case you want to use node commands, you can run:

```sh
$ azk nvm node [command]

# Or

$ azk nvm npm [command]
```

If you want to install any dependencies, it might work similar to this:

```sh
$ azk nvm npm install gulp
```

And then you can use it by running:

```sh
$ azk nvm gulp
```


### Contributing code

We always welcome code contributions, be it fixing an issue or adding new features.

The general workflow follows these steps:

- Open an issue / Find an issue / Suggest a feature via our GitHub Issues page
- Discuss the issue/feature with our team of developers and community members
- Take ownership of the issue/feature
- Fork `azk`
- Create a feature branch and begin work
- Sync your work with the main branch from time to time
- Open PR and iterate
- Accepted and Merged!

In shell commands, that will look something like:

```sh
# Fork azk repository
$ git clone https://github.com/your_username/azk.git
$ cd azk
$ git checkout -b feature/feature_name
# Make changes to files
$ make clean && make
# Run tests
$ azk nvm npm test
$ git add .
$ git commit -m "[my new feature] Fixing some system tests"
$ git push
# Open PR from your feature branch to azk's master branch
```

Remember to make a fork directly on [GitHub][github]. All contributions are made through _Pull Requests_ to the main repository **`master`** branch.


### Branches organization

- `master` is the development branch.

  The **`master`** branch is where new features are started, and where they are merged.

- `stable` is the stable version.

  The **`stable`** branch is the latest stable version of `azk`. It's the one which we use to build the binaries, available on package managers.


### Conventions


#### Branches

When creating a branch that you're going to work on, remember to name it as `feature/feature_name`.


#### Commit message

The commit message follows the convention:

```sh
git commit -m '[YOUR_BRANCH_NAME] comment'
```

This helps us when querying and filtering the git history, to see where changes came from in the future.


### Testing

`azk` uses [mocha] as the testing framework, and [gulp] coordinates the necessary tasks for daily use.

To run the `azk` tests, the `azk agent` must be running:

```bash
$ azk agent start
...
azk: Agent has been successfully started.
$ azk nvm npm test
```

#### Integration tests

The `azk` integration tests are written using [bats] and can be found inside the folder "`specs/integration`". Before running the tests you need to install some dependencies:

```bash
$ make dependencies
```

Now you can run the integration tests with:

```bash
$ azk nvm gulp integration
```

Note that running these tests requires you to have the `azk agent` running.


#### Filtering tests

We can filter the tests to run specific sections, or a single one with:

```bash
$ azk nvm gulp test --grep="Azk command init run"
```

Similar to the functional tests, you can filter which integration tests will be executed:

```bash
$ azk nvm gulp integration --grep="force to replace a"
```


### Adding or updating dependencies

To help manage `azk` dependencies, we use `npm's shrinkwrap` to lock down the versions we use (more information about that [here](https://docs.npmjs.com/cli/shrinkwrap)). Because of that, if you need to add a dependency to `azk`, or update an existing one, make sure to generate the [`npm-shrinkwrap.json`](https://github.com/azukiapp/azk/blob/master/npm-shrinkwrap.json) file again.

You can find more information about the commands [here](https://docs.npmjs.com/cli/shrinkwrap#building-shrinkwrapped-packages), but it should be as simples as:

1. Run "npm install" in the package root to install the current versions of all dependencies.
1. Add or update dependencies. "npm install" each new or updated package individually and then update package.json. Note that they must be explicitly named in order to be installed: running npm install with no arguments will merely reproduce the existing shrinkwrap.
1. Validate that the package works as expected with the new dependencies.
1. Run "npm shrinkwrap", commit the new npm-shrinkwrap.json, and publish your package.


### Opening a Pull Request


Before opening a pull request, make sure that you:

- Test the azk binary with your changes:

```sh
$ make clean && make
# Make sure you're running azk from your development folder, not from a package manager
$ azk nvm npm test
```

- Merge cleanly with master

Your work should merge cleanly with master. In case there was additional work done in master after you created your branch, do a `git rebase`:

```sh
$ git remote add upstream https://github.com/azukiapp/azk.git
$ git fetch --all
$ git checkout master
$ git merge upstream/master
$ git checkout feature/your_feature_name
$ git rebase master
```

In case you have already made a push to your repository, after doing a `rebase` you'll need to make a `git push -f`.

- Have commits that are small logical units of work

During development you may end up with a big number of commits that may have unclear commit messages, or that could have been squashed together with previous work. One thing you can do is use `git rebase -i` to change your previous commits. These changes can range from simply making sure that all commit messages follow the repository conventions, to squashing changes from multiple commits into a single one.

```sh
$ git rebase -i HEAD~X
# X being the number of commits you want to rebase
```

If you need help doing any of the above, just open a PR and we'll help you through it. :)


#### Pull Request format

When opening a pull request, you should include the following information:

```
Issues that are closed by this PR (Use they keyword "closes", so the issues are closed automatically after the work is merged)

Description of the pull request:

How to test the PR:
1.
2.
3.

Additional info:
```

[babeljs]: http://babeljs.io
[babeljs compat-table]: https://babeljs.io/docs/learn-es6/
[bats]: https://github.com/sstephenson/bats
[Forking Workflow]: https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow
[git flow]: http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/
[github]: https://github.com/azukiapp/azk
[gitter]: https://gitter.im/azukiapp/azk
[gulp]: http://gulpjs.com/
[issues]: https://github.com/azukiapp/azk/issues
[mocha]: http://visionmedia.github.io/mocha/
[node.js]: http://nodejs.org/
[pull requests]: https://github.com/azukiapp/azk/pulls
[bluebird-generators]: https://github.com/petkaantonov/bluebird/blob/master/API.md#generators
