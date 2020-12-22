import { basicEnv } from '../../fixtures/env';
import { Module } from '../../types';
import { when, whenNotDryrun, whenNotVerify } from '../when';

/* eslint-env node, jest */
describe('when', () => {
  let spy: Module;
  beforeEach(() => {
    spy = jest.fn() as Module;
  });

  describe('when()', () => {
    it('is called when condition meets', async (done) => {
      await when((env) => env.stage === 'beta', spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });

    it('is not called when condition fails', async (done) => {
      const envOutput = await when(
        (env) => env.stage === 'production',
        spy,
        basicEnv
      );

      expect(spy).not.toHaveBeenCalled();
      expect(envOutput.stage).toBe('beta');
      done();
    });

    it('can be curried', async (done) => {
      const isProduction = when((env) => env.stage === 'production');

      const envOutput = await isProduction(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
      expect(envOutput.stage).toBe('beta');
      done();
    });
  });
  describe('whenNotDryrun()', () => {
    it('is not called when dry run', async (done) => {
      await whenNotDryrun(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
    it('is called when not dry run', async (done) => {
      const localEnv = { ...basicEnv, dryrun: false };
      await whenNotDryrun(spy, localEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('whenNotVerify()', () => {
    it('is not called when verify is on', async (done) => {
      const localEnv = { ...basicEnv, verify: true };
      await whenNotVerify(spy, localEnv);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
    it('is called when verify is off', async (done) => {
      await whenNotVerify(spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
