import { CoreProperties as PackageJson } from '@schemastore/package';

export type Stage = 'canary' | 'beta' | 'production';

/**
 * Possible modes:
 * - `range`: publishes all packages separately
 * - `synchronized`: publishes all packages with the same determined version
 * - `synchronizedMain`: assures all packages have the same major version
 * - `grouped`: publishes packages in synchronised groups based on folder names
 */
export type Mode = 'range' | 'synchronized' | 'synchronizedMain' | 'grouped';

export type Config = {
  debug: boolean;
  /** remote git */
  remote: string;
  /** git branch */
  branch: string;
  /** path to published packages - if you need more, use `packagePaths` */
  packagePath?: string;
  packagePaths?: string[];
  /** path to a folder that will contain the changelog files */
  changelogPath: string;
  /** path to the metadata file */
  metadataPath: string;
  /** registry to talk to. Defaults to npmjs */
  registry: string;
  mode: Mode;
  /** tag used to publish packages - usually `latest` */
  tag: string;
  /** releases are only alowed on a dedicated branch */
  productionBranch: string;
  /** beta releases are only alowed on a dedicated branch */
  betaBranch: string;
  /** the branch all the code is merged to (usually master) */
  mainBranch: string;
  /** tag used to publish beta versionspackages - usually `beta` */
  betaTag: string;
};

export type Status = {
  /** commit Hash of last release */
  lastReleaseHash: string;
  /** list of all packages including their version number */
  versions: Record<string, string>;
};

export type Message = {
  hash: string;
  date: string;
  message: string;
  body: string;
};

export type Env = {
  /** The stage as demanded by the command line - canary, beta or production */
  stage: Stage;
  /** dry run leaves out the persisting steps to check the outcome and changed files */
  dryrun: boolean;
  /** verify only analyses the current status and prints out results */
  verify: boolean;
  /** forces release of all packages */
  force: boolean;
  /** root of the project */
  appRoot: string;
  /** main package.json */
  pkg?: PackageJson;
  /** all config values */
  config?: Config;
  /** the detected current git branch */
  currentBranch?: string;
  /** files that are not committed yet */
  uncommittedFiles?: string[];
  /** all github tags */
  allTags?: string[];
  /** tags in order from current commit hash downwards */
  tagsInTree?: string[];
  /** Status from previous runs */
  status?: Status;
  /** Hash of the last commit */
  currentHash?: string;
  /** Hash of the last release */
  lastReleaseHash?: string;
  /** previous rlsr.json available? */
  hasStatusFile?: boolean;
  /** affected messages */
  commitMessages?: Message[];
};

export type Module = (env: Env) => Promise<Env> | Env;
