import { composeAsync } from '../helpers/compose-async';
import { wait } from '../helpers/wait-module';
import { log } from '../helpers/log-module';

export const persist = composeAsync(
  log('PERSIST PHASE: publishing files and committing to git'),

  // publish to defined npm
  // publish

  // revert certain changes
  // to be discussed: we might not put the changes into the package.jsons but
  // rather keep them in a dedicated file, which makes the process less prone
  // to git conflicts.
  // revertTemporaryChanges

  // all remaining files must be committed to git
  // commitPersistentChanges

  wait(1000)
);
