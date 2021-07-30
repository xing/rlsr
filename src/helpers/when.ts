import { complement, curry } from 'ramda';

import { Env, Module, Stage } from '../types';

type ChoiceFn = (env: Env) => boolean;

export const when = curry((whenFn: ChoiceFn, moduleFn: Module, env: Env) =>
  whenFn(env) ? moduleFn(env) : Promise.resolve(env)
);

export const isDryRun: ChoiceFn = (env) => env.config?.impact === 'dryrun';
export const isVerify: ChoiceFn = (env) =>
  env.config?.impact === 'verify' || env.config?.impact === 'dryrun';
export const isStage = curry((stage: Stage, env: Env) => env.stage === stage);

export const whenNotDryrun = when(complement(isDryRun));
export const whenNotVerify = when(complement(isVerify));

export const whenStage = (stage: Stage) => when(isStage(stage));
export const whenNotStage = (stage: Stage) => when(complement(isStage(stage)));
