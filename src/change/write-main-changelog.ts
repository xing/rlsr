import { writeFileSync, existsSync, mkdirSync } from 'fs';

import type { Module } from '../types';
import { logger } from '../helpers/logger';

const { error, log } = logger('[change] write main changelog');

export const writeMainChangelog: Module = (env) => {
  const mainChangeLogDir = env.config!.changelogPath;
  const mainChangeLogPath = env.mainChangelogPath;

  if (!mainChangeLogDir) {
    const errorMessage =
      '"changelogPath" attribute not found on env config object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  if (!existsSync(mainChangeLogDir)) {
    mkdirSync(mainChangeLogDir, {
      recursive: true,
    });
  }

  log('writing main changelog');

  writeFileSync(
    mainChangeLogPath!,
    `${JSON.stringify(env.changelog, null, 2)}\n`
  );
  return env;
};
