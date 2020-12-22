import { Env, Module } from '../../types';
import { when, whenNotDryrun, whenNotVerify } from '../when';

const env: Env = {
  stage: 'beta',
  dryrun: true,
  verify: false,
  appRoot: '/',
};

/* eslint-env node, jest */
describe('when', () => {
  let spy: Module;
  beforeEach(() => {
    spy = jest.fn() as Module;
  });

  describe('when()', () => {
    it('is called when condition meets', async (done) => {
      await when((env) => env.stage === 'beta', spy, env);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });

    it('is not called when condition fails', async (done) => {
      const envOutput = await when(
        (env) => env.stage === 'production',
        spy,
        env
      );

      expect(spy).not.toHaveBeenCalled();
      expect(envOutput.stage).toBe('beta');
      done();
    });

    it('can be curried', async (done) => {
      const isProduction = when((env) => env.stage === 'production');

      const envOutput = await isProduction(spy, env);
      expect(spy).not.toHaveBeenCalled();
      expect(envOutput.stage).toBe('beta');
      done();
    });
  });
  describe('whenNotDryrun()', () => {
    it('is not called when dry run', async (done) => {
      await whenNotDryrun(spy, env);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
    it('is called when not dry run', async (done) => {
      const localEnv = { ...env, dryrun: false };
      await whenNotDryrun(spy, localEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('whenNotVerify()', () => {
    it('is not called when dry run', async (done) => {
      const localEnv = { ...env, verify: true };
      await whenNotVerify(spy, localEnv);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
    it('is called when not dry run', async (done) => {
      await whenNotVerify(spy, env);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
