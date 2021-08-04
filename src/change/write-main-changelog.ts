import { existsSync, mkdirSync } from 'fs';

import type { Module } from '../types';
import { logger } from '../helpers/logger';
import { writeFile } from '../helpers/write-file';
import { missingEnvAttrError } from '../helpers/validation-errors';

const topic = '[change] write main changelog';
const { log } = logger(topic);

export const writeMainChangelog: Module = (env) => {
  const mainChangeLogDir = env.config!.changelogPath;
  const mainChangeLogPath = env.mainChangelogPath!;

  if (!mainChangeLogDir) {
    missingEnvAttrError('changelogPath', topic);
  }

  if (!existsSync(mainChangeLogDir)) {
    mkdirSync(mainChangeLogDir, {
      recursive: true,
    });
  }

  log('writing main changelog');
  writeFile(mainChangeLogPath, env.changelog!);

  return env;
};
