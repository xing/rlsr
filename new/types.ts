import { CoreProperties as PackageJson } from '@schemastore/package';

export type Stage = 'canary' | 'beta' | 'production';

export type Mode =
  | 'range'
  | 'synchronized'
  | 'synchronizedMain'
  | 'synchronizedGroups';

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
  /** path to the metadata file */
  mode: Mode;
  /** tag used to publish packages - usually `latest` */
  tag: string;
  /** tag used to publish beta versionspackages - usually `beta` */
  betaTag: string;
};

export type Env = {
  /** The stage as demanded by the command line - canary, beta or production */
  stage: Stage;
  /** dry run leaves out the last step to verify the outcome */
  dryrun: boolean;
  /** root of the project */
  appRoot: string;
  /** main package.json */
  pkg?: PackageJson;
  /** all config values */
  config?: Config;
};

export type Module = (env: Env) => Promise<Env> | Env;
