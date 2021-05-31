import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

export const change = composeAsync(
  log('CHANGE PHASE: writing all relevant files locally'),

  // write new contents into package jsons
  // writeToPackageJsons

  // write new versions into central version file
  // writeToRlsrVersionFile

  // create new entries for changelog
  // writeToChangelog
  wait(1000)
);
