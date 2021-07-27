import type { Module } from '../types';
import { logger } from '../helpers/logger';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const { error, log } = logger('[change] write main changelog');

export const writeMainChangelog: Module = (env) => {
  const mainChangeLogDir = env.config!.changelogPath;
  const mainChangeLogFile = join(env.config!.changelogPath, 'changelog.json');

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

  writeFileSync(mainChangeLogFile, JSON.stringify(env.changelog, null, 2));
  return { ...env };
};
