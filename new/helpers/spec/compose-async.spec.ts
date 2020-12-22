import { Env, Module } from '../../types';
import { composeAsync } from '../compose-async';
import { wait } from '../wait-module';

const env: Env = {
  stage: 'beta',
  dryrun: true,
  appRoot: '/',
};

/* eslint-env node, jest */
describe('compose async', () => {
  it('can compose several sync modules to one', async (done) => {
    const s1: Module = (env) => {
      return { ...env, stage: 'production' };
    };
    const s2: Module = (env: Env) => {
      return { ...env, appRoot: '/foo' };
    };
    const resultEnv: Env = await composeAsync(s1, s2)(env);

    expect(resultEnv.stage).toBe('production');
    expect(resultEnv.appRoot).toBe('/foo');
    done();
  });

  it('can compose several async modules to one', async (done) => {
    const s1 = wait(50);
    const s2: Module = (env: Env) => {
      return Promise.resolve({ ...env, appRoot: '/foo' });
    };
    const resultEnv: Env = await composeAsync(s1, s2)(env);

    expect(resultEnv.appRoot).toBe('/foo');
    done();
  });
  it('can compose sunc and async modules to one', async (done) => {
    const s1 = wait(50);
    const s2: Module = (env: Env) => {
      return { ...env, appRoot: '/foo' };
    };
    const resultEnv: Env = await composeAsync(s1, s2)(env);

    expect(resultEnv.appRoot).toBe('/foo');
    done();
  });
});
