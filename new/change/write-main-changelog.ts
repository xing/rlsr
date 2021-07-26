import type { Module } from '../types';
import { logger } from '../helpers/logger';
import { join } from 'path';
import fs from 'fs';

const { error, log } = logger('[change] write main changelog');

export const writeMainChangelog: Module = (env) => {
  const mainChangeLogDir = env.config!.changelogPath;
  const mainChangeLogFile = join(env.config!.changelogPath, 'changelog.json');

  if (!mainChangeLogDir) {
    const errorMessage = 'changelog path is undefined!';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  if (!fs.existsSync(mainChangeLogDir)) {
    fs.mkdirSync(mainChangeLogDir, {
      recursive: true,
    });
  }

  log(`writing main changelog, ${mainChangeLogFile}`);
  fs.writeFileSync(mainChangeLogFile, JSON.stringify(env.changelog, null, 2));
  return { ...env };
};
