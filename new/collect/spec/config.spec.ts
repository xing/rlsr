import { Env } from '../../types';
import { config } from '../config';
import { resolve } from 'path';

const env: Env = {
  stage: 'beta',
  dryrun: true,
  appRoot: resolve(__dirname, '../../../'),
};

/* eslint-env node, jest */
describe('config module', () => {
  it('reads the current config from package.json adds config defaults to env', async (done) => {
    const resultEnv = await config(env);

    expect(resultEnv.config).toBeDefined();
    // a default value
    expect(resultEnv.config?.remote).toBe('origin');
    // an overridden value
    expect(resultEnv.config?.debug).toBeTruthy();
    done();
  });
});
