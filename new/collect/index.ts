import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';
import { config } from './config';
import { mainPackage } from './main-package';
import { startReport } from './start-report';

export const collect = composeAsync(
  log('PHASE 1: collecting data'),
  config,
  // check if user is logged into npm
  mainPackage,
  startReport,
  // read commit messages since last release or since tag or since beginning
  // read all package.jsons
  //
  wait(1000)
);
