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

const mockPackagesPaths: string[] = [
  'path/to/first/package.json',
  'path/to/second/package.json',
];
const mockSync = jest.fn(() => mockPackagesPaths);
jest.doMock('glob', () => ({ sync: mockSync }));

describe('addAllPackageJsons Module', () => {
  let result: Env;
  let addAllPackageJsons: Module;
  beforeAll(() => {
    addAllPackageJsons = require('../add-all-package-jsons').addAllPackageJsons;
  });

  it('configures logger', () => {
    expect(mockLogger).toHaveBeenCalledTimes(1);
    expect(mockLogger).toHaveBeenCalledWith('add all package.json');
  });

  describe('when used', () => {
    beforeAll(() => {
      result = addAllPackageJsons(envWithConfig) as Env;
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

      expect(mockLog).toHaveBeenNthCalledWith(
        2,
        'yellow(2) package.json found'
      );
    });

    it('should return the collection of package.json files present in the project', () => {
      const expected = {
        ...envWithConfig,
        packageJsonPaths: mockPackagesPaths,
      };
      expect(result).toEqual(expected);
    });
  });
});
