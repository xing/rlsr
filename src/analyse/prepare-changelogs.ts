import { existsSync, readFileSync } from 'fs';

import { join } from 'path';

import { white } from 'chalk';
import { clone } from 'ramda';

import { getWeekNumber } from '../helpers/get-week-number';

import type {
  Module,
  PackageAfterDetermineVersion,
  PackageChangelog,
  MainChangelog,
  Message,
  RelatedMessage,
} from '../types';

import { logger } from '../helpers/logger';

import { getReleasablePackages } from '../helpers/get-releasable-packages';

const { error, log } = logger('[analyse] prepare changelogs');

export const prepareChangelogs: Module = (env) => {
  if (!env.config?.changelogPath) {
    const errorMessage =
      '"config.changelogPath" attribute not found on env config object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  if (!env.packages) {
    const errorMessage = '"packages" attribute not found on env config object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  const clonePackages = clone(env.packages);
  const releasablePackages = getReleasablePackages(clonePackages);

  if (!releasablePackages.length) {
    const errorMessage = 'No packages to be released found!';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  const changelogDate = `${getWeekNumber(new Date()).join('-')}`;
  const mainChangelogPath = join(
    `${env.config.changelogPath}`,
    `rlsr-log-${changelogDate}.json`
  );

  const mainChangelogContent: MainChangelog = { [changelogDate]: [] };

  if (existsSync(mainChangelogPath)) {
    Object.assign(
      mainChangelogContent,
      JSON.parse(readFileSync(mainChangelogPath, 'utf8'))
    );
  }

  releasablePackages.forEach((packageName) => {
    const currentPackage = clonePackages[
      packageName
    ] as PackageAfterDetermineVersion;
    const version = currentPackage.incrementedVersion;
    const changelogFile = join(currentPackage.path, 'changelog.json');

    log(
      `preparing changelog messages for "${white(packageName)}" on ${white(
        version
      )}`
    );

    const pkgMessages: Message[] = currentPackage.messages;
    const relatedMessages: RelatedMessage[] = currentPackage.relatedMessages;
    const messages = [...pkgMessages, ...relatedMessages];

    if (!messages.length) {
      const errorMessage = `No messages found for "${white(packageName)}"`;
      error(errorMessage);
      throw new Error(errorMessage);
    }

    const changelogContent: PackageChangelog = {};

    if (existsSync(changelogFile)) {
      Object.assign(
        changelogContent,
        JSON.parse(readFileSync(changelogFile, 'utf8'))
      );
    }

    changelogContent[version] = messages;
    log(`add message on package changelog`);

    clonePackages[packageName] = {
      ...currentPackage,
      changelogs: changelogContent,
    };

    log(`add message on main changelog`);

    mainChangelogContent[changelogDate].push({
      package: packageName,
      version,
      messages,
    });
  });

  return {
    ...env,
    packages: clonePackages,
    mainChangelogPath,
    changelog: mainChangelogContent,
  };
};
