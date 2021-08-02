import { clone } from 'ramda';
import { yellow } from 'chalk';

import { Module } from '../types';

import { logger } from '../helpers/logger';
import { missingEnvAttrError } from '../helpers/validation-errors';

const topic = '[analyse] create dependency tree';
const { log } = logger('[analyse] create dependency tree');

export const createDependencyTree: Module = (env) => {
  if (!env.packages) {
    missingEnvAttrError('packages', topic);
  }

  const packagesClone = clone(env.packages!);
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
    packagesClone[packageName].dependsOn.forEach(({ name, type, range }) => {
      // register itself (together with the npm version range this current package needs) of each dependency
      packagesClone[name].dependingOnThis.push({
        name: packageName,
        type,
        ownPackageRange: range,
      });
    });
  });

  log(
    `Successfully registered ${yellow(counter.default)} dependencies, ${yellow(
      counter.devDependencies
    )} devDependencies and ${yellow(counter.peerDependencies)} peerDependencies`
  );

  return { ...env, packages: packagesClone };
};
