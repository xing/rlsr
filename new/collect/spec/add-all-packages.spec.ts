/* eslint-env node, jest */

import type { Env, Module } from '../../types';
import { envWithConfig } from '../../fixtures/env';

// mock chalk
const mockYellow = jest.fn((text) => `yellow(${text})`);
jest.doMock('chalk', () => ({ yellow: mockYellow }));

// mock Logger
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({
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
mockPackagesPaths.forEach((mockPackagesPath) => {
  jest.doMock(mockPackagesPath, () => mockPackages[mockPackagesPath], {
    virtual: true,
  });
});

// mock Glob
const mockSync = jest.fn(() => mockPackagesPaths);
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
      result = addAllPackages(envWithConfig) as Env;
    });

    it('logs an introduction', () => {
      expect(mockLog).toHaveBeenNthCalledWith(1, 'Search for all package.json');
    });

    it('uses the right golb pattern for package.json', () => {
      expect(mockSync).toHaveBeenCalledTimes(1);
      expect(mockSync).toHaveBeenCalledWith(
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
          path: 'path/to/first/',
          packageJson: mockPackages['path/to/first/package.json'],
          messages: [],
          relatedMessages: [],
          determinedIncrementLevel: -1,
          dependingOnThis: [],
          dependsOn: [],
        },
        mockSecondPackage: {
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
  it.todo('throws an error on unnamed packages (packages.json field)');
});
