import { config } from '../config';
import { basicEnv } from '../../fixtures/env';

/* eslint-env node, jest */
describe('config module', () => {
  it('reads the current config from package.json adds config defaults to env', async (done) => {
    const resultEnv = await config(basicEnv);

    expect(resultEnv.config).toBeDefined();
    // a default value
    expect(resultEnv.config?.remote).toBe('origin');
    // an overridden value
    expect(resultEnv.config?.debug).toBeTruthy();
    done();
  });
});
