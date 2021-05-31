import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

export const analyse = composeAsync(
  log('ANALYSE PHASE: Looking at what needs to be changed'),

  // See polish-packages.js
  // prefill package data with empty defaults
  // and add all dependencies (default, dev and peer)
  // addDependencies

  // See refine-messages.js
  // add metadata to the messages by parsing
  // refineMessages

  // See add-relations-to-packages.js
  // this creates a tree of dependencies - directly connects the files to each other
  // and also adds the inverted relation (parent-child/child-parent)
  // createDependencyTree,

  // see add-messages-to-packages.js
  // a package now contains a list of messages with severities etc.
  // addMessagesToPackages

  // see calculate-overall-increment.js
  // for information purposes, we create an overall version number
  // calculateRepoVersion

  // the next four should possibly created from scratch - it's the heart of the system
  // references are
  // - src/transform/synchronized-add-related-messages.js
  // - src/transform/synchronized-update-all-versions.js
  // - src/transform/unsynchronized-calculate-new-version.js
  // - src/transform/unsynchronized-update-relations.js

  // based on the currently changed files that come from relevant commits
  // (major, minor, patch level) find all packages that are indirectly affected, too.
  // e.g. if button is updated, all packages that depend on button are affected
  // as well and are put on a list.
  // Please take into account that the packages might be new.
  // findAffectedPackages,

  // Find out how much the package must be incremented
  // determineIncrement,

  // knowing the increment, the new version number can be easily calculated
  // adaptVersionNumbers,

  // But only if the range is not enough. Alo leave a release note for them.
  // knowing the new version number, the dependency from findAffectedPackages
  // can be changes as well.
  // changeDependencies,

  // see calculate-main-changelog-entries.js
  // Changelog must be prepared correctly, so the relevant data must be arranged
  // for each package
  // prepareChangelog

  // there surely is stuff to clanup and rearrange
  // this is the place for it - before parts of the env are being written down
  // cleanUp

  wait(1000)
);
