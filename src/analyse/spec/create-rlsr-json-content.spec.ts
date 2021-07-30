/* eslint-env node, jest */
import type { Env, Module } from '../../types';

import { envWithConfig } from '../../fixtures/env';

import { createMockPackage } from '../fixtures/createMockPackage';

// mock Logger
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({
  error: mockError,
  log: mockLog,
}));
jest.doMock('../../helpers/logger', () => ({
  logger: mockLogger,
}));

describe('[analyse] createRlsrJsonContent module', () => {
  let createRlsrJsonContent: Module;
  beforeAll(() => {
    createRlsrJsonContent =
      require('../create-rlsr-json-content').createRlsrJsonContent;
  });

  it('throws an exception when "env.packages" is not defined', () => {
    const expectedError = 'missing "packages" on env object';
    expect(() => createRlsrJsonContent(envWithConfig)).toThrow(expectedError);
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedError);
  });

  describe('on Run', () => {
    let result: Env;

    beforeAll(async () => {
      const mockedEnv: Env = {
        ...envWithConfig,
        packages: {
          package1: createMockPackage(
            'package1',
            {},
            {},
            {
              currentVersion: '1.0.0',
              incrementedVersion: '1.1.0',
              dependsOn: [
                {
                  name: 'package2',
                  range: '1-3',
                  type: 'default',
                },
              ],
            }
          ),
          package2: createMockPackage(
            'package2',
            {},
            {},
            {
              currentVersion: '2.0.0',
              dependsOn: [],
            }
          ),
        },
      };
      result = await createRlsrJsonContent(mockedEnv);
    });

    it('adds the github commit hash', () => {
      expect(result.newStatus).toBeDefined();
      expect(result.newStatus?.lastReleaseHash).toEqual('hash');
    });

    it('adds all packages it finds', () => {
      expect(result.newStatus?.packages).toHaveProperty('package1');
      expect(result.newStatus?.packages).toHaveProperty('package2');
    });

    it('adds the incremented version if it finds any', () => {
      expect(result.newStatus?.packages.package1).toHaveProperty(
        'version',
        '1.1.0'
      );
    });
    it('keeps existing version if the package has not been touched', () => {
      expect(result.newStatus?.packages.package2).toHaveProperty(
        'version',
        '2.0.0'
      );
    });
    it('lists the dependencies', () => {
      expect(result.newStatus?.packages.package1).toHaveProperty(
        'dependencies'
      );
      expect(result.newStatus?.packages.package1.dependencies).toHaveProperty(
        'package2'
      );
      expect(
        result.newStatus?.packages.package1.dependencies.package2
      ).toHaveProperty('type', 'default');
      expect(
        result.newStatus?.packages.package1.dependencies.package2
      ).toHaveProperty('range', '1-3');
    });
  });
});
