/* eslint-env node, jest */
import type { Env, Module, Package } from '../../types';
import { envWithConfig } from '../../fixtures/env';

// mock Packages
const mockPackageBuilder: (path: string, name: string) => Package = (
  path,
  name
) => ({
  path,
  packageJson: { name },
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: -1,
  dependingOnThis: [],
  dependsOn: [],
});

const mockEnvPackages: Env['packages'] = {
  mock1Package: mockPackageBuilder('path/to/1/', 'mock1Package'),
  mock2Package: mockPackageBuilder('path/to/2/', 'mock2Package'),
  mock3Package: mockPackageBuilder('path/to/3/', 'mock3Package'),
  mock4Package: mockPackageBuilder('path/to/4/', 'mock4Package'),
};
mockEnvPackages.mock1Package.packageJson.dependencies = {
  lodash: '1',
  mock2Package: '1.0.0',
};
mockEnvPackages.mock1Package.packageJson.devDependencies = {
  eslint: '1',
  mock3Package: '^1',
};
mockEnvPackages.mock1Package.packageJson.peerDependencies = {
  react: '1',
  mock4Package: '2.5.0 - 3',
};

// mock Logger
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({ error: mockError, log: mockLog }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

describe('addDependencies Module', () => {
  let addDependencies: Module;
  beforeAll(() => {
    addDependencies = require('../add-dependencies').addDependencies;
  });

  it('Sets up a logger', () => {
    expect(mockLogger).toBeCalledTimes(1);
    expect(mockLogger).toBeCalledWith('[analyse] add dependencies');
  });

  it("Throws an exception if 'env.packages' is empty", () => {
    const expectedErrorMessage =
      '"packages" attribute not found on env config object';

    expect(() => addDependencies(envWithConfig)).toThrow(expectedErrorMessage);

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });
  describe('when executed', () => {
    let result: Env;
    beforeAll(() => {
      result = addDependencies({
        ...envWithConfig,
        packages: mockEnvPackages,
      }) as Env;
    });

    it('logs an introduction message', () => {
      expect(mockLog).toBeCalledTimes(1);
      expect(mockLog).toBeCalledWith("Populating packages' dependencies");
    });

    it('returns an Env config object with populated "dependsOn" dependencies', () => {
      const expectedEnv: Env = {
        ...envWithConfig,
        packages: {
          ...mockEnvPackages,
          mock1Package: {
            ...mockEnvPackages.mock1Package,
            dependsOn: [
              { name: 'mock2Package', type: 'default', range: '1.0.0' },
              { name: 'mock3Package', type: 'dev', range: '^1' },
              { name: 'mock4Package', type: 'peer', range: '2.5.0 - 3' },
            ],
          },
        },
      };
      expect(result).toEqual(expectedEnv);
    });
  });
});
