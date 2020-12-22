import type { Env, Module } from '../types';

type WaitModule = (t: number) => Module;

export const wait: WaitModule = (t) => (env: Env) =>
  new Promise<Env>((resolve) => setTimeout(() => resolve(env), t));
