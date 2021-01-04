import { mainPackage } from '../main-package';
import { basicEnv } from '../../fixtures/env';

/* eslint-env node, jest */
describe('mainPackage module', () => {
  it('reads the current package.json and adds it to the env', async (done) => {
    const resultEnv = await mainPackage(basicEnv);

    expect(resultEnv.pkg).toBeDefined();
    expect(resultEnv.pkg?.name).toBeDefined();
    expect(resultEnv.pkg?.name).toBe('rlsr');
    done();
  });
});
