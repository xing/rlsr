import semver from 'semver';

import { clone } from 'ramda';

import { white } from 'chalk';

import type { Module, PackageAfterDetermineVersion } from '../../types';

import { logger } from '../../helpers/logger';

import { getReleasablePackages } from '../../helpers/get-releasable-packages';

const { error, log } = logger('[analyse] adapt dependencies');

export const adaptDependencies: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object.';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('analyse affected packages');
  const clonePackages = clone(env.packages);
  const releasablePackages = getReleasablePackages(clone(clonePackages));

  log(`${Object.keys(releasablePackages).length} packages will be released`);

  releasablePackages.forEach((packageName) => {
    log(`Analysing packages depending on ${white(packageName)}`);

    const currentPackage = clonePackages[
      packageName
    ] as PackageAfterDetermineVersion;
    currentPackage.dependingOnThis.forEach((dependingPackage) => {
      // Only process related packages if their given dependency range won't cover the releasable package's new version
      if (
        semver.satisfies(
          currentPackage.incrementedVersion,
          dependingPackage.ownPackageRange
        )
      ) {
        return;
      }

      const relatedPackage = clonePackages[dependingPackage.name];

      // Make sure the related package is flagged to get at least a patch release
      if (relatedPackage.determinedIncrementLevel === -1) {
        relatedPackage.determinedIncrementLevel++;
      }
      // Add Message
      relatedPackage.relatedMessages.push({
        date: new Date().toISOString(),
        text: `fix: dependency "${packageName}" has changed from ${currentPackage.currentVersion} to ${currentPackage.incrementedVersion}`,
        level: 'patch',
      });

      // Adapt ranges to include the releasable package's new version
      const lowerVersionLimit =
        dependingPackage.ownPackageRange === 'new'
          ? // If 'new' is used as version range, then we must use the new version as the lower range edge
            currentPackage.incrementedVersion
          : semver.minVersion(dependingPackage.ownPackageRange)?.raw;
      // Upper limit is extended to allow all future path releases on this package
      const upperVersionLimit = semver.inc(
        currentPackage.incrementedVersion,
        'minor'
      );
      const dependingOnPackage = clonePackages[
        dependingPackage.name
      ].dependsOn.find(({ name }) => name === packageName);

      if (dependingOnPackage === undefined) {
        const errorMessage = `"${packageName}" is not registered as a dependency (dependsOn) on "${dependingPackage.name}"`;
        error(errorMessage);
        throw new Error(errorMessage);
      }

      if (lowerVersionLimit === undefined) {
        const errorMessage = `Cannot determine lower limit declared dependency ("${packageName}") version (${dependingPackage.ownPackageRange}) on package "${dependingPackage.name}"`;
        error(errorMessage);
        throw new Error(errorMessage);
      }
      if (upperVersionLimit === null) {
        const errorMessage = `Invalid increased version "${currentPackage.incrementedVersion}" for package ${packageName}`;
        error(errorMessage);
        throw new Error(errorMessage);
      }
      const newOwnPackageRange = `>=${lowerVersionLimit} <${upperVersionLimit}`;
      log(
        `Extend version range on ${white(dependingPackage.name)} from ${white(
          dependingPackage.ownPackageRange
        )} to ${white(newOwnPackageRange)}`
      );
      dependingOnPackage.range = newOwnPackageRange;

      log(
        `Extend version range for ${white(dependingPackage.name)} on ${white(
          packageName
        )} from ${white(dependingPackage.ownPackageRange)} to ${white(
          newOwnPackageRange
        )}`
      );
      dependingPackage.ownPackageRange = newOwnPackageRange;
    });
  });

  return { ...env, packages: clonePackages };
};
