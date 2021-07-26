/* eslint-env node, jest */

import type { Env, Module } from '../../types';
import { envWithConfig } from '../../fixtures/env';

// mock chalk
const mockYellow = jest.fn((text) => `yellow(${text})`);
jest.doMock('chalk', () => ({ yellow: mockYellow }));

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

// mock Packages
const mockPackages: Record<string, { name: string }> = {
  'path/to/first/package.json': { name: 'mockFirstPackage' },
  'path/to/second/package.json': { name: 'mockSecondPackage' },
};
const mockPackagesPaths = Object.keys(mockPackages);

// mock Glob
const mockSync = jest.fn((globPattern) => {
  return globPattern === `${envWithConfig.appRoot}/package.json`
    ? []
    : mockPackagesPaths;
});
jest.doMock('glob', () => ({ sync: mockSync }));

describe('addAllPackages Module', () => {
  let result: Env;
  let addAllPackages: Module;
  beforeAll(() => {
    addAllPackages = require('../add-all-packages').addAllPackages;
  });

  it('configures logger', () => {
    expect(mockLogger).toHaveBeenCalledTimes(1);
    expect(mockLogger).toHaveBeenCalledWith('add all packages');
  });

  describe('when used', () => {
    beforeAll(() => {
      mockPackagesPaths.forEach((mockPackagesPath) => {
        jest.doMock(mockPackagesPath, () => mockPackages[mockPackagesPath], {
          virtual: true,
        });
      });
      result = addAllPackages(envWithConfig) as Env;
    });

    it('logs an introduction', () => {
      expect(mockLog).toHaveBeenNthCalledWith(1, 'Search for all package.json');
    });

    it('uses the right golb pattern for the main package.json', () => {
      expect(mockSync).toHaveBeenCalledTimes(2);
      expect(mockSync).toHaveBeenNthCalledWith(
        1,
        `${envWithConfig.appRoot}/package.json`
      );
    });
    it('uses the right golb pattern for package.json', () => {
      expect(mockSync).toHaveBeenCalledTimes(2);
      expect(mockSync).toHaveBeenNthCalledWith(
        2,
        `${envWithConfig.appRoot}/!(node_modules)/**/package.json`
      );
    });

    it('logs found packages', () => {
      expect(mockYellow).toHaveBeenCalledTimes(1);
      expect(mockYellow).toHaveBeenCalledWith(2);

      expect(mockLog).toHaveBeenNthCalledWith(2, 'yellow(2) packages found');
    });

    it('should return the collection of packages present in the project', () => {
      const expectedPackages: Env['packages'] = {
        mockFirstPackage: {
          currentVersion: '1.0.0',
          path: 'path/to/first/',
          packageJson: mockPackages['path/to/first/package.json'],
          messages: [],
          relatedMessages: [],
          determinedIncrementLevel: -1,
          dependingOnThis: [],
          dependsOn: [],
        },
        mockSecondPackage: {
          currentVersion: '1.0.0',
          path: 'path/to/second/',
          packageJson: mockPackages['path/to/second/package.json'],
          messages: [],
          relatedMessages: [],
          determinedIncrementLevel: -1,
          dependingOnThis: [],
          dependsOn: [],
        },
      };

      const expected: Env = {
        ...envWithConfig,
        packages: expectedPackages,
      };

      expect(result).toEqual(expected);
    });
  });

  it('throws an error on unnamed packages (packages.json field)', () => {
    jest.resetModules();
    jest.mock('path/to/first/package.json', () => ({}), { virtual: true });
    jest.mock('path/to/second/package.json', () => ({}), { virtual: true });
    const mockEnv: Env = { ...envWithConfig };
    const expectedErrorMessage = `Missing "name" attribute for package <path/to/first/package.json>`;

    expect(() => addAllPackages(mockEnv)).toThrow(expectedErrorMessage);

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });
});
