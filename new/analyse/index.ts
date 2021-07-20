import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

import { addDependencies } from './add-dependencies';
import { createDependencyTree } from './create-dependency-tree';
import { extendDependencyRanges } from './extend-dependency-ranges';
import { addPackageNamesToMessages } from './add-package-names-to-messages';
import { addMessagesToPackages } from './add-messages-to-packages';
import { determineDirectIncrement } from './determine-direct-increment';
import { determineVersion } from './determine-version';

export const analyse = composeAsync(
  log('ANALYSE PHASE: Looking at what needs to be changed'),

  // adds all dependencies (default, dev and peer)
  //
  // prefill package data with empty defaults
  // and add all dependencies (default, dev and peer)
  // be aware that usually this information comes from the `env.status` object
  // and not from the package.json (except on the first run)
  // if that is the case, you'll find a dependency range of `*`
  //
  // REMAINING TODOS
  // (1) We don't need dev dependencies here - it's enough when they stick to having `*`
  // so you can safely filter out dev deps and only concentrate on peer and default deps
  // (2) Als missing: If a `rlsr.json` is present (see `env.status`), it already has data
  // that fits to that data structure and in most cases contains the actual ranges. These
  // structures must get merged.
  // (3) For point 2, the package.json has precendence unless it contains a `*` in the range.
  // This automatically includes cases qith the keyword `new` as dependency range
  addDependencies,

  // We do one sanity check/change before the action starts
  // this is only important for the first run, because we can't know how the dependencies are set up.
  // We widen the range of dependencies.
  // So if the range is strictly toed to one version (i.e. `1.2.3` instead of ^1.2.3), we widen it
  // to allow all patch versions. SO go through all dependencies (and peer / dev), look for that pattern
  // and prepend a `^`.
  // As we produce widened ranges throughout the process, this has no effect anymore from the second run onwards.
  extendDependencyRanges,

  // See add-relations-to-packages.js
  // this creates a tree of dependencies - directly connects the files to each other
  // and also adds the inverted relation (parent-child/child-parent)
  // it's actually quite easy to do. just go through all packages, look at the dependencies
  // then jump to that dependency object in the env and add the current package name there.
  // We actually wouldn't need 3 objects (peer, default, dev deps), but it will be easier to find them
  // It also makes sens to directly add the current dependency range.
  // The ideal structure for later use would be an array of
  // {
  //   packageName
  //   type (default dev peer)
  //   range: npm version range string like `^2`... what is currently there
  // }
  createDependencyTree,

  // Adding messages to the packages is a two step process.
  // That's different from the former rlsr script, that had the package name in the message
  // like `feat(@xingternal/button): do something`.
  // Since the brewery release script, we determine the package from the committed files.
  // STEP 1:
  // So the first step is adding packages to messages by looking at each file.
  // It's implemented in the changelog part of brewery release in
  // addAffectedPAckages.ts and util.ts
  // the principle is: go through all files of the commit message (they're already attached to the message)
  // then `findUp` for the package.json and extract the package name from there.
  addPackageNamesToMessages,

  // STEP 2:
  // Then it's easy to turn this around. Each package (the previously created data structure in env)
  // now gets the message added. I.e. go through all messages. Get the package names from there
  // then go to the package and add that message over there.
  addMessagesToPackages,

  // up next, we need a first version run.
  // from the messages attached to the packages, we need to find out the increment
  // 0 = patch, 1 = minor, 2 = major
  // Just go through all messages, map them to that number and find the mathematical maximum.
  determineDirectIncrement,

  // with that increment, we can now calculate the new version number and store it in a new variable
  // the existing version number should still be there, so don't override.
  // 0 => Patch is being incremented
  // 1 => Minor is incremented, patch is 0
  // 2 => Major is incremented, minor and patch are 0
  // `semver.bump` (/src/transform/semver) has the code.
  determineVersion, // (first run, we run that once again later)

  // the next step will be the most complex in the analyse phase.
  // It's about incrementing the dependents if needed
  // Starting simple:
  // - traverse through each changed package (whose incement is > -1)
  // - go into each of the packages that depend on it (we've created that list before)
  // - look at the dependency range it has and find out if it already satisfies the range
  //   the public `semver` package has functions to do that.
  // - if yes, do nothing, all good
  // - if no, the other package gets a patch release
  //   - look at the other package. if the increment is at `-1`, set it to `0`
  //   - add an artificial message to its relatedMessages array
  //     type `fix`, text `dependency <name> has changed from <x> to <y>`
  //   - change the range of the related dependency to e.g. `>=1.2.7 <1.3.0`
  //   - you get the lower range value with `semver.minVersion` from the semver npm package
  //   - SPECIAL CASE: If you find the keyword `new` instead of the range, the lower range
  //     value is set to the new package version number of the dependency
  //     e.g. `1.1.0` => `>= 1.1.1`
  //   - you get the upper range version by a minor bump of the new package version number
  //     e.g. if the new version number is `3.0` and the old range was ^2, the new range becomes
  //     >=2.0.0 <3.1.0
  // for testing purposes, it makes sense to extract the essential parts into simple pure functions
  // adaptDependencies,

  // as some increments have changed, we re-run the previous `determineVersion` script
  // because only patch changes are added and patch changes are always within the range,
  // we don't have to run `adaptDependencies` a second time.

  // determineVersion (second run),

  // finally, we go through some re-arrangements

  // firstly the changelog
  // all packages now have several changelog messages
  // - go through all of them, merge them to a single array per package and strip them down
  //   to what is actually needed (e.g. we don't need the affected files anymore etc.)
  // - finally bring all previously created relatedMessages back to the top level message list
  // - and do the same strip-down with that list
  // In the end, we should have similar changelog objects in each package and at the top
  // prepareChangelogs

  // secondly the package jsons
  // we finally will have two new variants.
  // variant one: used for publishing contains the new dependency ranges
  // variant two: used for github contains "*" as dependency values.
  // (variant zero: the previous version remains as it is - we keep it for debugging)
  // createPackageJsonContent

  // thirdly the rlsr json
  // as the package jsons won't have the dependency information anymore (there's only `*`)
  // !! this is only true for internal packages. External libs stay of course.
  // we need to store it elsewhere. It will move to the rlsr.json
  // this file will look like
  // {
  //   lastCommitHash: "<hash>",
  //   packages: {
  //     <packagename>: {
  //       version: "<new version>",
  //       dependencies: [
  //         {
  //           name: "dependency",
  //           type: "default" | "peer",
  //           range: "<new range>"
  //         }.
  //         ...
  //       ]
  //     }
  //   }
  // }
  // all the needed info is available, so this only has to be assembled together.
  // createRlsrJsonContent

  // final final step
  // it might be worth spitting out some needed information
  // so we create a log module
  // print
  // - all packages that receive increments
  // - the bump `<x> --> <y>`
  // - the bump type (major red, minor yellow, patch green)
  // - the previous commit hash as a github link to click on
  // - the new commit hash as a github link to click on
  // all in a nice and quickly readable way
  // printReport

  wait(1000)
);
