import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

export const change = composeAsync(log('PHASE 2: changing files'), wait(1000));
