/* eslint-env node, jest */
import { sync } from 'glob';

import type { Env, Module } from '../../types';

// mock chalk
const mockWhite = jest.fn((text) => `white(${text})`);
const mockYellow = jest.fn((text) => `yellow(${text})`);
jest.mock('chalk', () => ({ yellow: mockYellow, white: mockWhite }));

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

import { envWithConfig } from '../../fixtures/env';

// mock Packages
const mockPackages: Record<string, { name: string }> = {
  'path/to/first/package.json': { name: 'mockFirstPackage' },
  'path/to/second/package.json': { name: 'mockSecondPackage' },
  '/node_modules/path/to/nodeModulesPackage1/package.json': {
    name: 'mockNodeModulesPackage1',
  },
  'path/to/first/node_modules/nodeModulesPackage2/package.json': {
    name: 'mockNodeModulesPackage2',
  },
};
const mockPackagesPaths = Object.keys(mockPackages);

// mock Glob
const mockSync = sync as jest.MockedFunction<typeof sync>;
mockSync.mockImplementation((globPattern) => {
  return globPattern === `${envWithConfig.appRoot}/package.json`
    ? []
    : mockPackagesPaths;
});
jest.mock('glob');

describe('addAllPackages Module', () => {
  let result: Env;
  let addAllPackages: Module;
  beforeAll(() => {
    addAllPackages = require('../add-all-packages').addAllPackages;
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

    it('uses the right golb pattern for all package.json', () => {
      expect(mockSync).toHaveBeenCalledTimes(1);
      expect(mockSync).toHaveBeenCalledWith(
        `${envWithConfig.appRoot}/**/package.json`
      );
    });

    it('logs found packages', () => {
      expect(mockLog).toHaveBeenLastCalledWith('yellow(2) packages found');
    });

    it('should return the collection of packages present in the project, excluding node_modules', () => {
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
