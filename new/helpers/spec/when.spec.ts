import { basicEnv } from '../../fixtures/env';
import { Module } from '../../types';
import {
  when,
  whenNotDryrun,
  whenNotVerify,
  isDryRun,
  isVerify,
  isStage,
  whenStage,
  whenNotStage,
} from '../when';

/* eslint-env node, jest */
describe('when', () => {
  let spy: Module;
  beforeEach(() => {
    spy = jest.fn() as Module;
  });

  describe('when()', () => {
    test('is called when condition meets', async (done) => {
      await when((env) => env.stage === 'beta', spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });

    test('is not called when condition fails', async (done) => {
      const envOutput = await when(
        (env) => env.stage === 'production',
        spy,
        basicEnv
      );

      expect(spy).not.toHaveBeenCalled();
      expect(envOutput.stage).toBe('beta');
      done();
    });

    test('can be curried', async (done) => {
      const isProduction = when((env) => env.stage === 'production');

      const envOutput = await isProduction(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
      expect(envOutput.stage).toBe('beta');
      done();
    });
  });
  describe('dry run and verify', () => {
    test('detecting dry run', () => {
      const nonDryRunEnv = { ...basicEnv, dryrun: false };
      expect(isDryRun(basicEnv)).toBeTruthy();
      expect(isDryRun(nonDryRunEnv)).toBeFalsy();
    });
    test('detecting verify', () => {
      const withVerifyEnv = { ...basicEnv, verify: true };
      expect(isVerify(basicEnv)).toBeFalsy();
      expect(isVerify(withVerifyEnv)).toBeTruthy();
    });
    test('whenNotDryrun() is not called when dry run', async (done) => {
      await whenNotDryrun(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
    test('whenNotDryrun() is called when not dry run', async (done) => {
      const localEnv = { ...basicEnv, dryrun: false };
      await whenNotDryrun(spy, localEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });

    test('whenNotVerify() is not called when verify is on', async (done) => {
      const localEnv = { ...basicEnv, verify: true };
      await whenNotVerify(spy, localEnv);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
    test('whenNotVerify() is called when verify is off', async (done) => {
      await whenNotVerify(spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
  });
  describe('stage detection - canary, beta, production', () => {
    test('isStage()', () => {
      expect(isStage('beta', basicEnv)).toBeTruthy();
      expect(isStage('beta')(basicEnv)).toBeTruthy();
      expect(isStage('production', basicEnv)).toBeFalsy();
      expect(isStage('production')(basicEnv)).toBeFalsy();
    });
    test('whenStage() is called when stage is correct', async (done) => {
      await whenStage('beta')(spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
    test('whenStage() is not called when stage is wrong', async (done) => {
      await whenStage('production')(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
    test("whenNotStage() is called when stage doesn't match", async (done) => {
      await whenNotStage('production')(spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
    test('whenNotStage() is not called when stage matches', async (done) => {
      await whenNotStage('beta')(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
  });
});
