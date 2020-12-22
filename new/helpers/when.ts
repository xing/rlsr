import { curry } from 'lodash/fp';
import { Env, Module } from '../types';

export const when = curry(
  (whenFn: (env: Env) => boolean, moduleFn: Module, env: Env) =>
    whenFn(env) ? moduleFn(env) : Promise.resolve(env)
);

export const whenNotDryrun = when((env) => !env.dryrun);
