import { composeAsync } from "../helpers/compose-async";
import { wait } from "../helpers/wait-module";
import { log } from "../helpers/log-module";
import { config } from "./config";
import { mainPackage } from "./main-package";
import { startReport } from "./start-report";
import { whenNotDryrun, whenNotStage } from "../helpers/when";
import { checkNpmPing, checkNpmLogin } from "./check-npm";
import { addGitStatus } from "./add-git-status";
import { checkGitStatus } from "./check-git-status";
import { readStatusFile } from "./read-status-file";
import { addLastReleaseHash } from "./add-last-release-hash";
import { addRawCommitMessages } from "./add-raw-commit-messages";
import { parseCommitMessages } from "./parse-commit-messages";

export const collect = composeAsync(
  log("COLLECT PHASE: gathering all data"),

  // #tested
  // reading the config and adding sane defaults
  config,

  // #tested
  // ping the npm registry to determine if it's available
  // will fail if it's not in the VPN for example
  whenNotDryrun(checkNpmPing),

  // #tested
  // checks if the user is logged in to the registry
  whenNotDryrun(checkNpmLogin),

  // #tested
  // add the top level package.json to the environment for later use
  mainPackage,

  // #tested
  // prints some useful status messages on which more it is running in
  startReport,

  // #tested
  // adds all available git information (branch, tags etc to the ENV)
  addGitStatus,

  // #tested
  // checks for uncommitted files and correct branch and stops if something is wrong
  whenNotStage("canary")(checkGitStatus),

  // #tested
  // status data from rlsr.json
  readStatusFile,

  // #tested
  // retrieve the last released commit hash to calculate diffs from
  addLastReleaseHash,

  // retrieve all commit messages since the last hash
  addRawCommitMessages,

  // use commitizen to properly parse the messages
  parseCommitMessages,

  // analyse the committed files and add them to the data sink
  // we have that already in the brewery release script (it makes
  // sense to have all projects open at the same time - brewery release,
  // this, the demo repo - I have them in one VSC workspace)
  // addFilesToCommitMessages,

  // read all package jsons and add them to the env for later use
  // addAllPackageJsons,

  // add all release-notes.md files and add them to the env for later use
  // we also have that code in brewery release
  // addMainNotes,

  wait(1000)
);
