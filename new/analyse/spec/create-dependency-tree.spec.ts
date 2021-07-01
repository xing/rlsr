/* eslint-env node, jest */
import { clone } from 'ramda';

import type { Env, Module, Package } from '../../types';

import { envWithConfig } from '../../fixtures/env';

// mock Packages
const buildPackage = (name: string): Package => ({
  messages: [],
  relatedMessages: [],
  dependingOnThis: {
    dependencies: [],
    peerDependencies: [],
    devDependencies: [],
  },
  dependsOn: { dependencies: [], peerDependencies: [], devDependencies: [] },
  determinedIncrementLevel: -1,
  path: `path/to/${name}`,
  packageJson: [],
});

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

// mock chalk
const mockYellow = jest.fn((text) => `yellow(${text})`);
jest.doMock('chalk', () => ({ yellow: mockYellow }));

describe('[analyse] createDependencyTree module', () => {
  let createDependencyTree: Module;

  beforeAll(() => {
    createDependencyTree =
      require('../create-dependency-tree').createDependencyTree;
  });

  it('sets up logger', () => {
    expect(mockLogger).toHaveBeenCalledTimes(1);
    expect(mockLogger).toHaveBeenCalledWith('[analyse] create dependency tree');
  });

  it('throws an exception when "env.packages" is not defined', () => {
    const expectedError = 'no packages found on env config object';
    expect(() => createDependencyTree(envWithConfig)).toThrow(expectedError);
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedError);
  });

  describe('on Run', () => {
    let expectedPackages: Record<string, Package>;
    let result: Env;

    beforeAll(() => {
      const mockPackages = {
        'test-package-1': buildPackage('test-package-1'),
        'test-package-2': buildPackage('test-package-2'),
        'test-package-3': buildPackage('test-package-3'),
        'test-package-4': buildPackage('test-package-4'),
      };

      // 1 depends on 2
      // 2 devDepends on 3
      // 3 peerDepends on 4
      // 4 doesn't depend on anyone
      mockPackages['test-package-1'].dependsOn.dependencies.push(
        'test-package-2'
      );
      mockPackages['test-package-2'].dependsOn.devDependencies.push(
        'test-package-3'
      );
      mockPackages['test-package-3'].dependsOn.peerDependencies.push(
        'test-package-4'
      );

      expectedPackages = clone(mockPackages);

      const mockEnv: Env = {
        ...envWithConfig,
        packages: mockPackages,
      };

      result = createDependencyTree(mockEnv) as Env;
    });

    it('logs introduction message', () => {
      expect(mockLog).toHaveBeenNthCalledWith(1, 'Analysing dependency tree');
    });

    it('registers dependencies tree correctly', () => {
      expectedPackages['test-package-2'].dependingOnThis.dependencies.push(
        'test-package-1'
      );
      expectedPackages['test-package-3'].dependingOnThis.devDependencies.push(
        'test-package-2'
      );
      expectedPackages['test-package-4'].dependingOnThis.peerDependencies.push(
        'test-package-3'
      );
      expect(result).toEqual({ ...envWithConfig, packages: expectedPackages });
    });

    it('logs results', () => {
      expect(mockYellow).toHaveBeenCalledTimes(3);
      expect(mockYellow).toHaveBeenNthCalledWith(1, 1);
      expect(mockYellow).toHaveBeenNthCalledWith(2, 1);
      expect(mockYellow).toHaveBeenNthCalledWith(3, 1);

      expect(mockLog).toHaveBeenNthCalledWith(
        2,
        'Successfully registered yellow(1) dependencies, yellow(1) devDependencies and yellow(1) peerDependencies'
      );
    });
  });
});
