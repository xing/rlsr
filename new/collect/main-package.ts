import { Config, Module } from '../types';
import { CoreProperties as PackageJson } from '@schemastore/package';
import { join } from 'path';
import { setDebug } from '../helpers/logger';

export const mainPackage: Module = (env) => {
  const pkg: PackageJson = require(join(env.appRoot, 'package.json'));
  const config: Config = {
    remote: 'origin',
    branch: 'master',
    packagePath: './packages',
    mode: '',
    debug: false,
    tag: 'latest',
    // adding config from package.json
    ...pkg.config?.rlsr,
  };
  setDebug(!!config.debug);
  return { ...env, pkg, config };
};
