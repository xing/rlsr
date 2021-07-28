import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

import { writePackageChangelogs } from './write-package-changelogs';
import { writeRlsrJson } from './write-rlsr-json';
import { writeMainChangelog } from './write-main-changelog';

export const change = composeAsync(
  log('CHANGE PHASE: writing all relevant files locally'),

  // write new contents into package jsons
  // in this case it's the variant with the dependency ranges.
  // Do this only if the increment is at least `0`.
  // The new content of the files should™ already be in the env (see createPackageJsonContent).
  // writePackageJsonsToNpm

  // write new versions into central rlsr.json file
  // The new content of the files should™ alsoalready be in the env
  // (see createrlsrJsonContent).
  writeRlsrJson

  // we maintain a single file with changelog content
  // - read this file if it exists (its structure is an array)
  // - prepend a new entry of the type
  //   {
  //     date: <currentDate> (new Date().toISOString()),
  //     changes: <content from env - see analyse step>
  //   }
  // - write the file
  // the new entry should be the topmost one
  writeMainChangelog,

  // additionally, we maintain a single changelog file for each package
  // - read this file if it exists (its structure is an array)
  // - prepend a new entry of the type
  //   {
  //     date: <currentDate> (new Date().toISOString()),
  //     version: new version of the related package
  //     changes: <content from env - see analyse step>
  //   }
  // - write the file
  // the new entry should be the topmost one and it should only be done for
  // packages that have at least an increment of `0`
  writePackageChangelogs,

  wait(1000)
);
