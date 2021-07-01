import { Module } from '../types';
import { clone } from 'ramda';
import { yellow } from 'chalk';

import { logger } from '../helpers/logger';

const { error, log } = logger('[analyse] create dependency tree');

export const createDependencyTree: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'no packages found on env config object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  const packagesClone = clone(env.packages);
  const counter = {
    dependencies: 0,
    devDependencies: 0,
    peerDependencies: 0,
  };

  log('Analysing dependency tree');

  Object.keys(packagesClone).forEach((packageName) => {
    counter.dependencies +=
      packagesClone[packageName].dependsOn.dependencies.length;
    packagesClone[packageName].dependsOn.dependencies.forEach((dependency) => {
      packagesClone[dependency].dependingOnThis.dependencies.push(packageName);
    });

    counter.devDependencies +=
      packagesClone[packageName].dependsOn.devDependencies.length;
    packagesClone[packageName].dependsOn.devDependencies.forEach(
      (dependency) => {
        packagesClone[dependency].dependingOnThis.devDependencies.push(
          packageName
        );
      }
    );

    counter.peerDependencies +=
      packagesClone[packageName].dependsOn.peerDependencies.length;
    packagesClone[packageName].dependsOn.peerDependencies.forEach(
      (dependency) => {
        packagesClone[dependency].dependingOnThis.peerDependencies.push(
          packageName
        );
      }
    );
  });

  log(
    `Successfully registered ${yellow(
      counter.dependencies
    )} dependencies, ${yellow(
      counter.devDependencies
    )} devDependencies and ${yellow(counter.peerDependencies)} peerDependencies`
  );

  return { ...env, packages: packagesClone };
};
