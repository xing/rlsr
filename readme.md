# rlsr

Manage automatic releases in a multi repo environment (comparable to
lerna and lerna-semantic-release)

## commitizen

A prerequisite for using the automatic release according to semver standards
is to stick to commits in the style of conventional changelog.

The easiest way to do this is using commitizen to replace the `git commit` command.

Based on commits formatted like this

`fix(my-package): description of contents``

The tool automatically

* creates changelogs
* updates package.jsons of the modules
* creates all needed tags
* persists everything to git
* finally publishes the relevant packages to npm

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
`npm run prepublish` or consequently with full effects
`npm run release`.

