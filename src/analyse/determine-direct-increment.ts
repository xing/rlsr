import { clone } from 'ramda';
import { green, red, yellow, white } from 'chalk';

import type { Package, Message, Module } from '../types';

import { logger } from '../helpers/logger';
import { missingEnvAttrError } from '../helpers/validation-errors';

const topic = '[analyse] determine direct increment';
const { log } = logger(topic);

const mapLevelToIncrementLevel: Record<
  Message['level'],
  Package['determinedIncrementLevel']
> = {
  misc: -1,
  patch: 0,
  minor: 1,
  major: 2,
};
const mapLevelToColour: Record<
  Message['level'],
  typeof green | typeof red | typeof yellow
> = {
  misc: white,
  patch: green,
  minor: yellow,
  major: red,
};

export const determineDirectIncrement: Module = (env) => {
  if (!env.commitMessages) {
    missingEnvAttrError('commitMessages', topic);
  }

  if (!env.packages) {
    missingEnvAttrError('packages', topic);
  }

  const clonePackages = clone(env.packages!);
  const packagesToRelease: Record<string, Message['level']> = {};

  log('analyse registered commitMessages');
  env.commitMessages!.forEach((commitMessage) => {
    commitMessage.affectedPackages?.forEach((affectedPackageName) => {
      const affectedPackage = clonePackages[affectedPackageName];

      affectedPackage.determinedIncrementLevel = Math.max(
        affectedPackage.determinedIncrementLevel,
        mapLevelToIncrementLevel[commitMessage.level]
      ) as Package['determinedIncrementLevel'];

      // Track affected packages to be releaed with their increemnt level
      // just for log purposes
      const possibleLevels = Object.keys(
        mapLevelToIncrementLevel
      ) as Message['level'][];
      packagesToRelease[affectedPackageName] =
        possibleLevels[affectedPackage.determinedIncrementLevel + 1];
    });
  });

  Object.entries(packagesToRelease).forEach(([packageName, level]) => {
    log(
      `"${white(packageName)}" flagged to have a ${mapLevelToColour[level](
        level
      )} release`
    );
  });

  return { ...env, packages: clonePackages };
};
