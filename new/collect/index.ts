import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';
import { config } from './config';
import { mainPackage } from './main-package';
import { startReport } from './start-report';
import { whenNotDryrun, whenNotVerify } from '../helpers/when';
import { checkNpmPing, checkNpmLogin } from './check-npm';

export const collect = composeAsync(
  log('PHASE 1: collecting data'),
  config,
  whenNotDryrun(checkNpmPing),
  whenNotDryrun(checkNpmLogin),
  mainPackage,
  startReport,
  // read commit messages since last release or since tag or since beginning
  // read all package.jsons
  //
  wait(1000)
);
