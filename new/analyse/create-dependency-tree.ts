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
    default: 0,
    devDependencies: 0,
    peerDependencies: 0,
  };

  log('Analysing dependency tree');

  // For each registered package
  Object.keys(packagesClone).forEach((packageName) => {
    // Extract its dependencies (default, dev & peer)
    const defaultDependencies = packagesClone[packageName].dependsOn.filter(
      (dependency) => dependency.type === 'default'
    );
    const devDependencies = packagesClone[packageName].dependsOn.filter(
      (dependency) => dependency.type === 'dev'
    );
    const peerDependencies = packagesClone[packageName].dependsOn.filter(
      (dependency) => dependency.type === 'peer'
    );

    // Count dependencies
    counter.default += defaultDependencies.length;
    counter.devDependencies += devDependencies.length;
    counter.peerDependencies += peerDependencies.length;

    // And for each of the current package dependencies
    [defaultDependencies, devDependencies, peerDependencies].forEach(
      // register itself (together with the npm version range this current package needs) of each dependency
      (dependsOnPackage) =>
        dependsOnPackage.forEach(({ name, type, range }) => {
          packagesClone[name].dependingOnThis.push({
            name: packageName,
            type,
            ownPackageRange: range,
          });
        })
    );
  });

  log(
    `Successfully registered ${yellow(counter.default)} dependencies, ${yellow(
      counter.devDependencies
    )} devDependencies and ${yellow(counter.peerDependencies)} peerDependencies`
  );

  return { ...env, packages: packagesClone };
};
