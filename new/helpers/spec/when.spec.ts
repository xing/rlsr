import { basicEnv } from '../../fixtures/env';
import { Env, Module } from '../../types';
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
    test('is called when condition meets', async () => {
      await when((env) => env.stage === 'beta', spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('is not called when condition fails', async () => {
      const envOutput = await when(
        (env) => env.stage === 'production',
        spy,
        basicEnv
      );

      expect(spy).not.toHaveBeenCalled();
      expect(envOutput.stage).toBe('beta');
    });

    test('can be curried', async () => {
      const isProduction = when((env) => env.stage === 'production');

      const envOutput = await isProduction(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
      expect(envOutput.stage).toBe('beta');
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
    test.only('whenNotDryrun() is not called when dry run', async () => {
      await whenNotDryrun(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
    });
    test('whenNotDryrun() is called when not dry run', async () => {
      const localEnv: Env = {
        ...basicEnv,
        config: { ...basicEnv.config!, impact: 'full' },
      };
      await whenNotDryrun(spy, localEnv);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('whenNotVerify() is not called when verify is on', async () => {
      const localEnv = { ...basicEnv, verify: true };
      await whenNotVerify(spy, localEnv);
      expect(spy).not.toHaveBeenCalled();
    });
    test('whenNotVerify() is called when verify is off', async () => {
      await whenNotVerify(spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
  describe('stage detection - canary, beta, production', () => {
    test('isStage()', () => {
      expect(isStage('beta', basicEnv)).toBeTruthy();
      expect(isStage('beta')(basicEnv)).toBeTruthy();
      expect(isStage('production', basicEnv)).toBeFalsy();
      expect(isStage('production')(basicEnv)).toBeFalsy();
    });
    test('whenStage() is called when stage is correct', async () => {
      await whenStage('beta')(spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    test('whenStage() is not called when stage is wrong', async () => {
      await whenStage('production')(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
    });
    test("whenNotStage() is called when stage doesn't match", async () => {
      await whenNotStage('production')(spy, basicEnv);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    test('whenNotStage() is not called when stage matches', async () => {
      await whenNotStage('beta')(spy, basicEnv);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
