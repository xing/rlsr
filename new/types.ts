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
  packagePath: string;
  packagePaths: string[];
  /** path to a folder that will contain the changelog files */
  changelogPath: string;
  /** path to the metadata file */
  metadataPath: string;
  /** registry to talk to. Defaults to npmjs */
  registry: string;
  mode: Mode;
  /** tag used to publish packages - usually `latest` */
  tag: string;
  /** tag used to publish beta versionspackages - usually `beta` */
  betaTag: string;
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
};

export type Module = (env: Env) => Promise<Env> | Env;
