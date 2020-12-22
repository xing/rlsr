import { command } from '../helpers/command';

export const checkNpmLogin = command(
  'check npm login',
  (env) => `npm whoami --registry=${env.config?.registry}`,
  'silent',
  'inf'
);

export const checkNpmPing = command(
  'npm ping',
  (env) => `npm ping --registry=${env.config?.registry}`,
  'silent',
  'inf'
);
