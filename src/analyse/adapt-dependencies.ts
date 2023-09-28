import * as semver from 'semver';

import { white, green } from 'chalk';

import type { Module, PackageAfterDetermineVersion } from '../types';

import { logger } from '../helpers/logger';

import { getReleasablePackages } from '../helpers/get-releasable-packages';

const { error, log } = logger('[analyse] adapt dependencies');

export const adaptDependencies: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object.';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('analyse affected packages');
  const clonePackages = structuredClone(env.packages);
  const releasablePackages = getReleasablePackages(
    structuredClone(clonePackages)
  );

  log(`${Object.keys(releasablePackages).length} packages will be released`);

  releasablePackages.forEach((packageName) => {
    log(`Analysing packages depending on ${white(packageName)}`);

    const currentPackage = clonePackages[
      packageName
    ] as PackageAfterDetermineVersion;
    currentPackage.dependingOnThis.forEach((dependingPackage) => {
      const isAsteriskRange = ['*', '^*', '~*'].includes(
        dependingPackage.ownPackageRange
      );
      /*
       * Only process related packages if their given dependency range won't
       * cover the releasable package's new version.
       * Asterisk ranges must be replaced and are processed below
       */
      if (
        !isAsteriskRange &&
        semver.satisfies(
          currentPackage.incrementedVersion,
          dependingPackage.ownPackageRange
        )
      ) {
        log(
          `${green(dependingPackage.name)}'s new verion "${green(
            currentPackage.incrementedVersion
          )}" is included in its declared dependency range "${green(
            dependingPackage.ownPackageRange
          )}"
         `
        );

        return;
      }

      const relatedPackage = clonePackages[dependingPackage.name];

      // Make sure the related package is flagged to get at least a patch release
      if (relatedPackage.determinedIncrementLevel === -1) {
        relatedPackage.determinedIncrementLevel++;
      }

      // Adapt ranges to include the releasable package's new version
      const lowerVersionLimit =
        // If '*', '^*' or '~*' is used as version range, then we must use the new version as the lower range edge
        isAsteriskRange
          ? currentPackage.incrementedVersion
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
      // Add Message
      relatedPackage.relatedMessages.push({
        date: new Date().toISOString(),
        text: `fix: adapt dependency "${packageName}" from ${dependingPackage.ownPackageRange} to ${newOwnPackageRange}`,
        level: 'patch',
      });

      log(
        `Extend version range for ${white(dependingPackage.name)} on ${white(
          packageName
        )} from ${white(dependingPackage.ownPackageRange)} to ${white(
          newOwnPackageRange
        )}`
      );
      dependingPackage.ownPackageRange = newOwnPackageRange;
    });

    currentPackage.dependsOn.forEach((dependingOnPackage) => {
      const isAsteriskRange = ['*', '^*', '~*'].includes(
        dependingOnPackage.range
      );
      if (!isAsteriskRange) return;

      const relatedPackage = clonePackages[
        dependingOnPackage.name
      ] as PackageAfterDetermineVersion;

      // Use relatedPackage (current or incremented) version as min limit
      const lowerVersionLimit =
        relatedPackage.incrementedVersion || relatedPackage.currentVersion;
      // Upper limit is extended to allow all future path releases on this package
      const upperVersionLimit = semver.inc(lowerVersionLimit, 'minor');

      const newPackageRange = `>=${lowerVersionLimit} <${upperVersionLimit}`;
      dependingOnPackage.range = newPackageRange;

      log(
        `Extend version range for ${white(dependingOnPackage.name)} on ${white(
          packageName
        )} from ${white(dependingOnPackage.range)} to ${white(newPackageRange)}`
      );

      relatedPackage.dependingOnThis.find(
        ({ name }) => name === packageName
      )!.ownPackageRange = newPackageRange;
    });
  });

  return { ...env, packages: clonePackages };
};
