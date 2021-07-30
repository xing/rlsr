import { command } from '../helpers/command';

export const checkNpmPing = command(
  'check npm ping',
  (env) =>
    `npm ping${
      env.config?.registry ? ` --registry=${env.config?.registry}` : ''
    }`,
  'silent',
  'inf'
);
