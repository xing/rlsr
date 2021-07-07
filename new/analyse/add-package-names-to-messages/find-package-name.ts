import type { Env } from '../../types';

import { dirname, join } from 'path';
import findUp from 'find-up';
import { readFileSync } from 'fs';

import { logger } from '../../helpers/logger';

const { error } = logger('[analyse] add package names to messages');

export const findPackageName = (
  appRoot: Env['appRoot'],
  filePath: string
): string => {
  const cwd = dirname(join(appRoot, filePath));
  const packageJsonPath = findUp.sync('package.json', {
    cwd,
  });

  if (!packageJsonPath) {
    const errorMessage = `No "package.json" found for ${filePath}`;
    error(errorMessage);
    throw new Error(errorMessage);
  }

  const parsedPackageJson = JSON.parse(
    readFileSync(packageJsonPath, { encoding: 'utf8' })
  );

  if (!parsedPackageJson.name) {
    const errorMessage = `${packageJsonPath} has no "name" property`;
    error(errorMessage);
    throw new Error(errorMessage);
  }

  return parsedPackageJson.name;
};
