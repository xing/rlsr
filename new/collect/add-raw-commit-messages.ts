import { pick } from "lodash/fp";
import { yellow } from "chalk";
import simpleGit, { SimpleGit } from "simple-git";
import { logger } from "../helpers/logger";
import { Module, Env } from "../types";

const { log } = logger("git messages");

/**
 * Get all commit messages between the last hash and now
 */
export const addRawCommitMessages: Module = async (env: Env) => {
  const git: SimpleGit = simpleGit();

  let data = await git.log({
    from: `${env.lastReleaseHash}^1`,
    to: env.currentHash,
  });

  // parsing and enriching
  const rawCommitMessages = data.all.map(
    pick(["hash", "date", "message", "body"])
  );

  log(`${yellow(rawCommitMessages.length)} overall affected commits`);

  return { ...env, rawCommitMessages } as Env;
};
