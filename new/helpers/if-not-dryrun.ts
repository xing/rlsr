import { Env, Module } from '../types';

export const ifNotDryrun = (fn: Module) => (env: Env) =>
  env.dryrun ? Promise.resolve(env) : fn(env);
