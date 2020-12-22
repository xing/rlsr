import { Config, Module } from '../types';
import { cosmiconfigSync } from 'cosmiconfig';
import { setDebug } from '../helpers/logger';

/**
 * Reads the current configuration with cosmic conf
 * `.rlsrrc`, package.json > rlsr and other formats allowed
 */
export const config: Module = (env) => {
  const cosmic = cosmiconfigSync('rlsr').search();

  const config: Config = {
    remote: 'origin',
    branch: 'master',
    packagePath: './packages',
    changelogPath: './changelogs',
    metadataPath: './',
    registry: 'https://registry.npmjs.org/',
    mode: '',
    debug: false,
    tag: 'latest',
    // adding config from package.json
    ...(cosmic?.config ?? {}),
  };
  if (config.packagePath && !config.packagePaths) {
    config.packagePaths = [config.packagePath];
  }
  setDebug(!!config.debug);
  return { ...env, config };
};
