import { readFileSync } from 'fs';
import path from 'path';

import { sync as glob } from 'glob';
import { white, yellow } from 'chalk';

import type { Module, ReleaseNote } from '../types';

import { logger } from '../helpers/logger';

const { log } = logger('add release notes');

export const addMainNotes: Module = (env) => {
  log('Search release notes');

  const releaseNotesFiles = glob(
    `${env.appRoot}/!(node_modules)/**/release-notes.md`
  );

  const releaseNotes = releaseNotesFiles.map((releaseNotesFile) => {
    const dirName = path.dirname(releaseNotesFile);
    const packageJsonPath = path.join(dirName, 'package.json');

    const packageJson: { name: string } = JSON.parse(
      readFileSync(packageJsonPath, 'utf8')
    );
    const content = readFileSync(releaseNotesFile, 'utf8');

    log(`found release notes for ${white(packageJson.name)}`);

    return {
      package: packageJson.name,
      releaseNote: {
        path: releaseNotesFile,
        content,
      },
    } as ReleaseNote;
  });

  log(`${yellow(releaseNotes.length)} release notes found`);

  return { ...env, releaseNotes };
};
