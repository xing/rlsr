import type { Module } from "../types";
import { sync as glob } from "glob";

const ROOT = process.cwd();

export const addAllPackageJsons: Module = (env) => {
  // Fetch all packageJson' paths
  const packageJsonPaths: string[] = glob(
    `${ROOT}/!(node_modules)/**/package.json`
  );

  return { ...env, packageJsonPaths };
};
