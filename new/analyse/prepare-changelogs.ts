// import { Message } from './../types';
import type { Module, PackageAfterPrepareChangelogs, ChangeLogMessage, Env } from '../types';
import { clone } from 'ramda';

// import path from 'path';
import fs from 'fs';

import { logger } from '../helpers/logger';
import { join } from 'path';

const { error, log } = logger('[analyse] prepare changelogs');

export const prepareChangelogs: Module = (env) => {
  if (!env.packages) {
    const errorMessage = '"packages" attribute not found on env config object';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  // todo: replace with the releasable packages implementation
  const releasablePackages = clone(env.packages)  as Record<string, PackageAfterPrepareChangelogs>;
  // console.dir(releasablePackages,  {depth: null });

  Object.entries(releasablePackages).forEach(([packageName, currentPackage]) => {
    log(`preparing changelog messages for ${packageName} `);

    const changelogFile = join(currentPackage.path, 'changelog.json');
    const version = currentPackage.incrementedVersion;
    const messages: ChangeLogMessage[] = currentPackage.messages.map(({message, hash} ) =>  ({message, hash}));

    if(!messages.length) {
      const errorMessage = `No changelog messages found for ${packageName}`;
      log(errorMessage);
      return;
      // throw new Error(errorMessage);
    }

    let changeLogContent: PackageAfterPrepareChangelogs["changelogs"] = {};

    if (fs.existsSync(changelogFile)) {
      changeLogContent = JSON.parse(fs.readFileSync(changelogFile, 'utf8'));
    }

    changeLogContent[version] = messages;

    log(`writing changelog messages for ${packageName} on ${version}`);
    currentPackage.changelogs = changeLogContent;

    log(`writing main changelog messages for ${packageName} on ${version}`);
    const changelogDate = new Date().toISOString().split('T')[0];
    const mainChangeLogFile = join(`${env.appRoot}/metadata/changelog/`, `${changelogDate}.json`);

    let mainChangeLogContent: Env["changelog"] = {};
    if (fs.existsSync(mainChangeLogFile)) {
      mainChangeLogContent = JSON.parse(fs.readFileSync(mainChangeLogFile, 'utf8'));
    }

    mainChangeLogContent![packageName]= {version, messages};
    env.changelog = mainChangeLogContent;

    // TODO: writing files will be implemented on later step
    // const newChangelogContent = JSON.stringify(changeLogContent, null, 2);
    // fs.writeFileSync(changelogFile, newChangelogContent, 'utf8');
    // fs.writeFileSync(mainChangelogFile, JSON.stringify(mainChangeLogContent, null, 2));
  });

  return { ...env, packages: releasablePackages };
}