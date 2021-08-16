import { white } from 'chalk';

import type { Module, Phase } from '../types';

// @ts-ignore
import { composeAsync } from './compose-async';
import { logger } from './logger';

export const plugins: (phase: Phase) => Module = (phase) => {
  const { error, log } = logger(`${phase} plugins`);

  return (env) => {
    if (!env.config?.plugins) {
      return env;
    }

    const plugins: Record<string, Module>[] = env.config.plugins.map(
      (plugin) => {
        try {
          log(`loading "${plugin}"`);
          const result = require(plugin);
          return result;
        } catch (e) {
          error(e);
        }
      }
    );
    const pluginModules = plugins
      .filter((plugin) => phase in plugin)
      .map((plugin) => plugin[phase]);
    if (pluginModules.length === 0) {
      log(`no plugin modules found for "${white(phase)}"`);
    }
    return composeAsync(...pluginModules)(env);
  };
};
