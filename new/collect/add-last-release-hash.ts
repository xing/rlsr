import { yellow } from "chalk";
import { logger } from "../helpers/logger";
import { Env, Module } from "../types";

const { error, log } = logger("prev hash");

export const findLastReleaseTag = (tags: string[], releaseTag: string) => {
  const relevant = tags.filter((t) => t.startsWith(releaseTag));
  return relevant[0];
};

/**
 * Identify the git commit hash of the last released version.
 * This is used to determine the commits to be released.
 */
export const addLastReleaseHash: Module = async (env: Env) => {
  if (env.status === undefined) {
    error("Missing rlsr.json config file");
    throw new Error("Missing rlsr.json config file");
  }

  let { lastReleaseHash } = env.status;

  // Grab the last release's hash from rlsr.json file (where it's usually stored)
  if (lastReleaseHash) {
    lastReleaseHash = lastReleaseHash;
  } else if (env.tagsInTree && env.tagsInTree.length > 0) {
    lastReleaseHash = findLastReleaseTag(env.tagsInTree, env.status.releaseTag);
  }

  lastReleaseHash
    ? log(`using ${yellow(lastReleaseHash)} as previous release's commit hash`)
    : log(
        `previous release hash cannot be determined. Assuming project's ${yellow(
          "initial release"
        )}`
      );

  return { ...env, lastReleaseHash };
};
