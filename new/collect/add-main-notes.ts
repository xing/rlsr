import type { Module, ReleaseNote } from "../types";
import { sync as glob } from "glob";
import { readFileSync } from "fs";
import path from "path";
import { yellow } from "chalk";

import { logger } from "../helpers/logger";

const { log } = logger("add release notes");

const ROOT = process.cwd();

export const addMainNotes: Module = (env) => {
  log("Search release notes");

  const files = glob(`${ROOT}/!(node_modules)/**/release-notes.md`);

  const releaseNotes = files.map((file) => {
    const dirName = path.dirname(file);
    const packageJsonPath = path.join(dirName, "package.json");

    const packageJson: { name: string } = JSON.parse(
      readFileSync(packageJsonPath, "utf8")
    );
    const releaseNoteMd = readFileSync(file, "utf8");

    log(`found release notes for ${packageJson.name}`);

    return {
      package: packageJson.name,
      releaseNoteMd,
    } as ReleaseNote;
  });

  log(`${yellow(releaseNotes.length)} release notes found`);

  return { ...env, releaseNotes };
};
