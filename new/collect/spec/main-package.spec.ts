import { Env } from '../../types';
import { mainPackage } from '../main-package';
import { resolve } from 'path';

const env: Env = {
  stage: 'beta',
  dryrun: true,
  verify: false,
  appRoot: resolve(__dirname, '../../../'),
};

/* eslint-env node, jest */
describe('main package module', () => {
  it('reads the current package.json and adds it to the env', async (done) => {
    const resultEnv = await mainPackage(env);

    expect(resultEnv.pkg).toBeDefined();
    expect(resultEnv.pkg?.name).toBeDefined();
    expect(resultEnv.pkg?.name).toBe('rlsr');
    done();
  });
});
