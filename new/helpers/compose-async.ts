import type { Module, Env } from '../types';

type ComposeAsync = (...fns: Module[]) => Module;

export const composeAsync: ComposeAsync =
  (...fns) =>
  (env: Env) => {
    return fns.reduce(
      (prev: Promise<Env>, curr: Module) => prev.then((env) => curr(env)),
      Promise.resolve(env)
    );
  };
