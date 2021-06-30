import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

export const persist = composeAsync(
  log('PERSIST PHASE: publishing files and committing to git'),

  // now that we have all relevant files in place locally
  // we can publish each of the packages to npm.
  // Again go through each package that has an increment of at least `0`
  // Then go into that folder and run `npm publish .` in there.
  // We don't want the output in the log (except in verbose mode).
  // But it's worth printing a success message for each released package.
  // publish

  // revert package.jsons
  // after the package is publishet, we bring back the package.jsons with the `*`
  // dependencies. The data structure should be in the env.
  // This is a very similar step to change > writeToPackageJsons
  // revertPackageJsons

  // finally the changed files must be added to git.
  // it's a
  // - `git add --all`
  // - `git commit -m "<a useful commit message>"`
  //    should probably contain all the bumps in the message body?!?
  // - git tag for each changed package (tag format `@xingternal/button@32.1.1`)
  // - `git pull`
  // - `git push`
  // - `git push --tags`
  // this contains a potential error source. What if someone has committed to master
  // in the meantime? So I'd also suggest to pull before push.
  // But I don't expect larger tree conflicts to happen anymore.
  // This commit is suppoesd to contain only rlsr.json and changelogs
  // package.jsons should only be in there if new packages are being added.
  // commitAndPushChanges

  wait(1000)
);
