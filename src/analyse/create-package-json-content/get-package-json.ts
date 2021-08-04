import { clone } from 'ramda';
import { white } from 'chalk';

import { Env, PackageAfterCreatePackageJsonContent } from '../../types';

import { logger } from '../../helpers/logger';

const { log } = logger('[analyse] create package json content');

function getPackageJson(
  packages: Env['packages'],
  packageName: string,
  type: 'npm'
): PackageAfterCreatePackageJsonContent['packageJsonNpm'];
function getPackageJson(
  packages: Env['packages'],
  packageName: string,
  type: 'git'
): PackageAfterCreatePackageJsonContent['packageJsonGit'];
function getPackageJson(
  packages: Env['packages'],
  packageName: string,
  type: 'npm' | 'git'
):
  | PackageAfterCreatePackageJsonContent['packageJsonNpm']
  | PackageAfterCreatePackageJsonContent['packageJsonGit'] {
  const isNpm = type === 'npm';

  const currentPackage = packages![packageName];

  const clonePackageJson = clone(currentPackage.packageJson);
  const dependsOnMap = isNpm
    ? Object.fromEntries(
        currentPackage.dependsOn.map((dependency) => [
          dependency.name,
          dependency,
        ])
      )
    : {};

  /**
   * NPM needs fixed version numbers, but in order to reduce conflicts while merging, we hardcode
   * `0.0.1-brewery` for each one on git and reference to them as dependencies as "*"
   * */
  if (isNpm) {
    if ('incrementedVersion' in currentPackage) {
      clonePackageJson.version = currentPackage.incrementedVersion;
    } else {
      /**
       * When only devDependencies change, packages are not flagged
       * to be released (and therefore they don't get an
       * `incrementedVersion` attribute either).
       * So `currentVersion` must be used for them.
       */
      log(
        `using "currentVersion" (${white(
          currentPackage.currentVersion
        )}) for package "${white(packageName)}" (${type})`
      );
      clonePackageJson.version = currentPackage.currentVersion;
    }
  } else {
    clonePackageJson.version = '0.0.1-brewery';
  }

  // package has dependencies
  if (clonePackageJson.dependencies) {
    // set all dependencies packages' versions as their given range for Npm or "*" for git
    Object.keys(clonePackageJson.dependencies)
      .filter((dependencyName) => dependencyName in packages!)
      .forEach((dependencyName) => {
        clonePackageJson.dependencies![dependencyName] = isNpm
          ? dependsOnMap[dependencyName].range
          : '*';
      });
  }

  // package has devDependencies
  if (clonePackageJson.devDependencies) {
    // set all devDependencies packages' versions as "*"
    Object.keys(clonePackageJson.devDependencies)
      .filter((dependencyName) => dependencyName in packages!)
      .forEach((dependencyName) => {
        clonePackageJson.devDependencies![dependencyName] = '*';
      });
  }

  // package has peerDependencies
  if (clonePackageJson.peerDependencies) {
    // set all peerDependencies packages' versions as their given range for Npm or "*" for git
    Object.keys(clonePackageJson.peerDependencies)
      .filter((dependencyName) => dependencyName in packages!)
      .forEach((dependencyName) => {
        clonePackageJson.peerDependencies![dependencyName] = isNpm
          ? dependsOnMap[dependencyName].range
          : '*';
      });
  }

  return clonePackageJson;
}

export { getPackageJson };
