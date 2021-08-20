import type { Module, Env } from '../types';

type ComposeAsync = (...functions: Module[]) => Module;

export const composeAsync: ComposeAsync =
  (...functions) =>
  (env: Env) => {
    return functions.reduce(
      (accumulator: Promise<Env>, currentFunction: Module) =>
        accumulator.then((env) => currentFunction(env)),
      Promise.resolve(env)
    );
  };
