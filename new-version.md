# Version 4.0

## move to typescript

Code will be ported to typescript and rearranged a little bit.

## Versionfile

We introduce a `rlsr.json` that contains all stored version and dependency data.
This file will be committed to the repo. It also contains the commit hash, the
scrip has been worked on last.

E.g.

```json
{
  "@xingternal/button": {
    "version": "30.1.1",
    "dependencies": {
      "@xingternal/typography": "20 - 23",
      "@xingternal/icons": "29 - 40"
    }
  }
}
```

In the actual package.json files, we replace the versions with simple
placeholders`"@xingternal/button": "*"`. That makes it much easier to do a
release in multi owner repos because these files remain very constant and will
never be touched by the release process.

## Changelog

In previous versions, the changelog has been persisted to static md files. This
time, we wil persist the raw data in JSOn files so they are usable in the
brewery app.

## Independent Mode

for the sake of simplifying, we only support independent mode from now on.
Meaning all packages are versioned independently from each other.
