import { CoreProperties as PackageJson } from '@schemastore/package';

export type Stage = 'canary' | 'beta' | 'production';

export type Mode =
  | 'range'
  | 'synchronized'
  | 'synchronizedMain'
  | 'synchronizedGroups';

export type Config = {
  debug: boolean;
  remote: string;
  branch: string;
  packagePath: string;
  mode: Mode;
  tag: string;
  betaTag: string;
};

export type Env = {
  stage: Stage;
  dryrun: boolean;
  appRoot: string;
  pkg?: PackageJson;
  config?: Config;
};

export type Module = (env: Env) => Promise<Env> | Env;
