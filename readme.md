# rlsr

Manage automatic releases in a multi repo environment (comparable to
lerna and lerna-semantic-release)

## commitizen

A prerequisite for using the automatic release according to semver standards
is to stick to commits in the style of conventional changelog.

The easiest way to do this is using commitizen to replace the `git commit` command.

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
* The word `BREAKING` somewhere in the message (subject or body) converts this to a **major** release
* The scope (sitting in brackets next to the type) is the most important part. It determines which package is tackled with the commit


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

Finally, you can use it for a dry run (without any persistence)
`npm run prepublish` (or `rlsr pre`) and check what it has created.

For the full power you can persist these changes with git commits and tags as well as the
npm publish using `npm run release` (or `rlsr pre && rlsr perform`).

## api

RLSR has some config values, that you can set inside your package.json in a `rlsr` section.

* `verbose` (boolean): `true` creates a lot more output for debugging purposes.
* `packagePath` (string): tells the system where the multi repo packages live (defaults to `./packages`)
