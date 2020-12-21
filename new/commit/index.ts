import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

export const commit = composeAsync(
  log('PHASE 3: commit and publish'),
  wait(1000)
);
