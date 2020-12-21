export type Stage = 'canary' | 'beta' | 'latest';

export type Env = {
  stage: Stage;
  dryrun: boolean;
  appRoot: string;
};

export type Module = (env: Env) => Promise<Env> | Env;
