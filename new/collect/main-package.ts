import { Env, Module } from '../types';
import { CoreProperties as PackageJson } from '@schemastore/package';
import { join } from 'path';

/**
 * Reads the top level package.json
 */
export const mainPackage: Module = (env: Env) => {
  const pkg: PackageJson = require(join(env.appRoot, 'package.json'));

  return { ...env, pkg };
};
