# rlsr

[![Build Status](https://travis-ci.org/xing/rlsr.svg?branch=master)](https://travis-ci.org/xing/rlsr)

Manage automatic releases in a multi repo environment (comparable to lerna and
lerna-semantic-release)

## commitizen

A prerequisite for using the automatic release according to semver standards is
to stick to commits in the style of conventional changelog.

The easiest way to do this is using commitizen to replace the `git commit`
command.

Based on commits formatted like this

```txt
fix(my-package): description of contents

BREAKING CHANGE: description of breaking stuff
```

## release process

Taking these commit messages, the tool automatically

* creates **changelogs**
* updates **package.jsons** of the modules
* updates package.jsons of the **related modules**
* creates all needed **git tags**
* persists everything as **git commit**s
* finally **publish**es the relevant packages to npm

For this the following rules apply:

* The type `feat` triggers a **minor** release
* The types `fix`, `refactor`, `perf`, `revert`trigger a **patch** release
* The word `BREAKING` somewhere in the message (subject or body) converts this
  to a **major** release
* The scope (sitting in brackets next to the type) is the most important part.
  It determines which package is tackled with the commit

## installation

As you would expect, you can simply install the package like

```sh
npm install -D rlsr
```

and after that add it to your package.json

```json
{
  ...
  "scripts": {
    "prerelease": "rlsr pre",
    "release": "rlsr perform"
  }
  ...
}
```

## usage

Finally, you can use it for a dry run (without any persistence) `npm run
prepublish` (or `rlsr pre`) and check what it has created.

For the full power you can persist these changes with git commits and tags as
well as the npm publish using `npm run release` (or `rlsr pre && rlsr perform`).

## dependency management

_rlsr_ understands two paradigms for handling dependencies from one monorepo
package to another.

* _exact_: The versions of dependencies are handled exact and recursively. A
  major bump for example leads to a patch bump of the related package and a
  dependency like `5.0.0`.
* _range_: The versions of dependencies are handled as a maximum range. A
  related package is only bumped when the range exceeds. In this case the range
  will be extended like `3.2.1 - 5`

## api

RLSR has some config values, that you can set inside your package.json in a
`rlsr` section.

* `verbose` (boolean): `true` creates a lot more output for debugging purposes.
* `packagePath` (string): tells the system where the multi repo packages live
  (defaults to `./packages`)
* `exactRelations` (boolean): use the exact paradigm for related versions
  (defaults to false)
* `scopeToNameMap` (object): map commit message scopes to a different package
  names. For example to use a shorter name in scopes or to handle renaming of
  packages.

## rlsr-latest

RLSR is able to fill in the latest version of a package to dependants. A
dependant package just needs to use `rlsr-latest` instead of a concrete version
in it's dependencies.

```json
{
  "my-package"
  "dependencies": {
    "my-dependency": "rlsr-latest"
  }
}
```

## FAQ

### How can I trigger a breaking change?

There are currently two criteria:

* The commit message type would itself trigger at least a patch release (`feat`,
  `fix`, `refactor`, `perf`, `revert`)
* AND the message subject ot the message body contains at least the term
  `BREAKING` in uppercase

The easiest way to achieve this is by using `commitizen` and enter something
under the BREAKING CHANGE topic.

### What triggers a minor release?

A message of type `feat(package-name)` triggers a minor release.

### What triggers a minor release?

A message of type `fix`, `refactor`, `perf` or `revert` triggers a minor
release.

### What does `previouslyUnreleased` in the package.json mean?

The two processes (`pre` and `perform`) are independent of each other. But they
use the main package.json as a amall data exchange layer.

`pre` leaves `previouslyUnreleased` as an information for `perform`. It tells
the second process which components need to be published. `perform` finally
removes this again. But you may stumble upon this package.json entry at times.
