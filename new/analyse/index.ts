import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

export const analyse = composeAsync(
  log('ANALYSE PHASE: Looking at what needs to be changed'),
  // this creates a tree of dependencies - directly connects the files to each other
  // and also adds the inverted relation (parent-child/child-parent)
  // createDependencyTree,

  // based on the currently changed files that come from relevant commits
  // (major, minor, patch level) find all packages that are affected, too.
  // e.g. if button is updated, all packages that depend on button are affected
  // as well and are put on a list.
  // findAffectedPackages,

  // Find out how much the package must be incremented
  // determineIncrement,

  // knowing the increment, the new version number can be easily calculated
  // adaptVersionNumbers,

  // But only if the range is not enough. Alo leave a release note for them.
  // knowing the new version number, the dependency from findAffectedPackages
  // can be changes as well.
  // changeDependencies,
  wait(1000)
);
