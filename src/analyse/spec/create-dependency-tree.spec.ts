/* eslint-env node, jest */
import type { Env, Module, Package } from '../../types';

import { envWithConfig } from '../../fixtures/env';

// mock Packages
const buildPackage = (name: string): Package => ({
  currentVersion: '1.0.0',
  messages: [],
  relatedMessages: [],
  dependingOnThis: [],
  dependsOn: [],
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
      mockPackages['test-package-1'].dependsOn.push({
        name: 'test-package-2',
        range: '1.0.0',
        type: 'default',
      });
      mockPackages['test-package-2'].dependsOn.push({
        name: 'test-package-3',
        range: '^1',
        type: 'dev',
      });
      mockPackages['test-package-3'].dependsOn.push({
        name: 'test-package-4',
        range: '2.5.0 - 3',
        type: 'peer',
      });

      expectedPackages = structuredClone(mockPackages);

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
      expectedPackages['test-package-2'].dependingOnThis.push({
        name: 'test-package-1',
        type: 'default',
        ownPackageRange: '1.0.0',
      });
      expectedPackages['test-package-3'].dependingOnThis.push({
        name: 'test-package-2',
        type: 'dev',
        ownPackageRange: '^1',
      });
      expectedPackages['test-package-4'].dependingOnThis.push({
        name: 'test-package-3',
        type: 'peer',
        ownPackageRange: '2.5.0 - 3',
      });
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
