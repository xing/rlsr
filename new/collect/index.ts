import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';
import { config } from './config';
import { mainPackage } from './main-package';
import { startReport } from './start-report';
import { whenNotDryrun, whenNotStage } from '../helpers/when';
import { checkNpmPing, checkNpmLogin } from './check-npm';
import { addGitStatus } from './add-git-status';
import { checkGitStatus } from './check-git-status';
import { readStatusFile } from './read-status-file';
import { addLastReleaseHash } from './add-last-release-hash';
import { addRawCommitMessages } from './add-raw-commit-messages';

export const collect = composeAsync(
  log('PHASE 1: collecting data'),

  // reading the config and adding sane defaults
  config,

  // pings the npm registry to determine if it's available
  whenNotDryrun(checkNpmPing),

  // checks if the user is logged in to the registry
  whenNotDryrun(checkNpmLogin),

  // add the top level package.json to the environment for later use
  mainPackage,

  // prints some useful status messages on which more it is running in
  startReport,

  // checks if user is on the right branch and has everything committed
  addGitStatus,
  whenNotStage('canary')(checkGitStatus),

  // status data from rlsr.json
  readStatusFile,

  // retrieve the last released hash to calculate diffs from
  addLastReleaseHash,

  // retrieve all commit messages since the last hash
  addRawCommitMessages,
  //parseCommitMessages,
  //addFilesToCommitMessages,

  //read all package jsons and add them to the env for later use
  // addAllPackageJsons,

  wait(1000)
);
