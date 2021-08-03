import { existsSync, readFileSync } from 'fs';

import { join } from 'path';

import { white } from 'chalk';
import { clone } from 'ramda';

import { getWeekNumber } from '../helpers/get-week-number';

import type {
  Module,
  PackageAfterDetermineVersion,
  PackageAfterPrepareChangelogs,
  PackageChangelog,
  MainChangelog,
  Message,
  RelatedMessages,
} from '../types';

import { logger } from '../helpers/logger';

import { getReleasablePackages } from '../helpers/get-releasable-packages';

const { error, log } = logger('[analyse] prepare changelogs');

export const prepareChangelogs: Module = (env) => {
  if (!env.packages) {
    const errorMessage = '"packages" attribute not found on env config object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  const clonePackages = clone(env.packages);
  const releasablePackages = getReleasablePackages(clonePackages);

  const changelogDate = `${getWeekNumber(new Date()).join('-')}`;
  const mainChangeLogPath = join(
    `${env.config!.changelogPath}`,
    `rlsr-log-${changelogDate}.json`
  );

  env.mainChangelogPath = mainChangeLogPath;
  let mainChangeLogContent: MainChangelog = { [changelogDate]: [] };

  releasablePackages.forEach((packageName) => {
    const currentPackage = clonePackages[
      packageName
    ] as PackageAfterDetermineVersion;
    log(`preparing changelog messages for ${white(packageName)} `);

    const changelogFile = join(currentPackage.path, 'changelog.json');
    const version = currentPackage.incrementedVersion;

    const pkgMessages: Message[] = currentPackage.messages;
    const relatedMessages: RelatedMessages[] = currentPackage.relatedMessages;

    const messages = [...pkgMessages, ...relatedMessages];

    if (!messages.length) {
      const errorMessage = `No messages found for "${white(packageName)}"`;
      error(errorMessage);
      throw new Error(errorMessage);
    }

    let changeLogContent: PackageChangelog = {};

    if (existsSync(changelogFile)) {
      changeLogContent = JSON.parse(readFileSync(changelogFile, 'utf8'));
    }

    changeLogContent[version] = messages;
    log(
      `writing changelog messages for "${white(packageName)}" on ${white(
        version
      )}`
    );

    clonePackages[packageName] = {
      ...clone(currentPackage),
      changelogs: changeLogContent,
    } as PackageAfterPrepareChangelogs;

    log(
      `writing main changelog messages for "${white(packageName)}" on ${white(
        version
      )}`
    );

    if (existsSync(mainChangeLogPath)) {
      mainChangeLogContent = JSON.parse(
        readFileSync(mainChangeLogPath, 'utf8')
      );
    }

    mainChangeLogContent![changelogDate].push({
      package: packageName,
      version,
      messages,
    });
    env.changelog = mainChangeLogContent;
  });

  return { ...env, packages: clonePackages };
};
