import type { Module } from "../types";
import { sync as glob } from "glob";
import { yellow } from "chalk";

import { logger } from "../helpers/logger";

const { log } = logger("add all package.json");

export const addAllPackageJsons: Module = (env) => {
  log("Search for all package.json");
  // Fetch all packageJson' paths
  const packageJsonPaths: string[] = glob(
    `${env.appRoot}/!(node_modules)/**/package.json`
  );

  log(`${yellow(packageJsonPaths.length)} package.json found`);

  return { ...env, packageJsonPaths };
};
