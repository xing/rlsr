import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';
import { mainPackage } from './main-package';
import { startReport } from './start-report';

export const collect = composeAsync(
  log('PHASE 1: collecting data'),
  mainPackage,
  startReport,
  wait(1000)
);
