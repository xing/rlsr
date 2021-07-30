import fs from 'fs';

import { join } from 'path';

import { clone } from 'ramda';

import type {
  Module,
  PackageAfterDetermineVersion,
  PackageAfterPrepareChangelogs,
  PackageChangelog,
  MainChangelog,
  ChangelogMessage,
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

  const changelogDate = new Date().toISOString();
  let mainChangeLogContent: MainChangelog = { [changelogDate]: [] };

  releasablePackages.forEach((packageName) => {
    const currentPackage = clonePackages[
      packageName
    ] as PackageAfterDetermineVersion;
    log(`preparing changelog messages for ${packageName} `);

    const changelogFile = join(currentPackage.path, 'changelog.json');
    const version = currentPackage.incrementedVersion;

    const pkgMessages: ChangelogMessage[] = currentPackage.messages.map(
      ({ message, hash }) => ({ message, hash })
    );

    const relatedMessages: ChangelogMessage[] =
      currentPackage.relatedMessages.map(({ text }) => ({
        message: text,
      }));

    const messages = pkgMessages.concat(...relatedMessages);

    if (!messages.length) {
      const errorMessage = `No messages found for ${packageName}`;
      error(errorMessage);
      throw new Error(errorMessage);
    }

    let changeLogContent: PackageChangelog = {};

    if (fs.existsSync(changelogFile)) {
      changeLogContent = JSON.parse(fs.readFileSync(changelogFile, 'utf8'));
    }
    changeLogContent[version] = messages;
    log(`writing changelog messages for ${packageName} on ${version}`);

    clonePackages[packageName] = {
      ...clone(currentPackage),
      changelogs: changeLogContent,
    } as PackageAfterPrepareChangelogs;

    log(`writing main changelog messages for ${packageName} on ${version}`);
    const mainChangeLogFile = join(
      `${env.config!.changelogPath}`,
      `${changelogDate.split('T')[0]}.json`
    );

    if (fs.existsSync(mainChangeLogFile)) {
      mainChangeLogContent = JSON.parse(
        fs.readFileSync(mainChangeLogFile, 'utf8')
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
