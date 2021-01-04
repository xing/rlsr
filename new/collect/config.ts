import { Config, Env, Module } from '../types';
import { cosmiconfigSync } from 'cosmiconfig';
import { setDebug } from '../helpers/logger';

export const defaultConfig: Config = {
  remote: 'origin',
  branch: 'master',
  packagePath: './packages',
  changelogPath: './changelogs',
  metadataPath: './',
  registry: 'https://registry.npmjs.org/',
  mode: 'grouped',
  debug: false,
  tag: 'latest',
  betaTag: 'beta',
  betaBranch: 'master',
  productionBranch: 'master',
  mainBranch: 'master',
};
/**
 * Reads the current configuration with cosmic conf
 * `.rlsrrc`, package.json > rlsr and other formats allowed
 */
export const config: Module = (env: Env) => {
  const cosmic = cosmiconfigSync('rlsr').search();

  const config: Config = {
    ...defaultConfig,
    // adding config from package.json
    ...(cosmic?.config ?? {}),
  };
  if (config.packagePath && !config.packagePaths) {
    config.packagePaths = [config.packagePath];
  }
  setDebug(!!config.debug);
  return { ...env, config };
};
