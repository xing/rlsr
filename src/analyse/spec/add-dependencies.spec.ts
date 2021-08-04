/* eslint-env node, jest */
import type {
  Env,
  Module,
  Package,
  RelatedPackageDependsOn,
} from '../../types';
import { envWithConfig } from '../../fixtures/env';
import { createMockPackage } from '../fixtures/createMockPackage';

// mock Packages
const mockPackageBuilder: (path: string, name: string) => Package = (
  path,
  name
) => ({
  currentVersion: '1.0.0',
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

  it("Throws an exception if 'env.packages' is empty", () => {
    const expectedErrorMessage = 'missing "packages" on env object.';

    expect(() => addDependencies(envWithConfig)).toThrow(expectedErrorMessage);

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  describe('without rlsr.json data', () => {
    let result: Env;
    beforeAll(() => {
      result = addDependencies({
        ...envWithConfig,
        packages: mockEnvPackages,
      }) as Env;
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
              { name: 'mock4Package', type: 'peer', range: '2.5.0 - 3' },
            ],
          },
        },
      };
      expect(result).toEqual(expectedEnv);
    });
  });

  describe('with rlsr.json data', () => {
    let result: Env;
    let dependencies: RelatedPackageDependsOn[];

    beforeAll(() => {
      const env: Env = {
        ...envWithConfig,
        status: {
          packages: {
            mockPackageUnderTest: {
              version: '1.0.0',
              dependencies: {
                mockPreviouslyAvailable: {
                  name: 'mockPreviouslyAvailableButOverwritten',
                  type: 'default',
                  range: '1 - 2',
                },
                mockPreviouslyAvailableButOverwritten: {
                  name: 'mockPreviouslyAvailableButOverwritten',
                  type: 'default',
                  range: '1 - 3',
                },
                mockPreviouslyAvailableButNew: {
                  name: 'mockPreviouslyAvailableButOverwritten',
                  type: 'default',
                  range: '1 - 4',
                },
              },
            },
            mockPreviouslyAvailable: {
              version: '1.0.0',
              dependencies: {},
            },
            mockPreviouslyAvailableButOverwritten: {
              version: '1.0.0',
              dependencies: {},
            },
            mockPreviouslyAvailableButNew: {
              version: '1.0.0',
              dependencies: {},
            },
          },
        },
        packages: {
          mockPackageUnderTest: createMockPackage('mockPreviouslyAvailable', {
            mockPreviouslyAvailable: '*',
            mockPreviouslyAvailableButOverwritten: '2 - 3',
            mockPreviouslyAvailableButNew: 'new',
            mockPreviouslyNotAvailable: '*',
          }),
          mockPreviouslyAvailable: createMockPackage('mockPreviouslyAvailable'),
          mockPreviouslyAvailableButOverwritten: createMockPackage(
            'mockPreviouslyAvailableButOverwritten'
          ),
          mockPreviouslyAvailableButNew: createMockPackage(
            'mockPreviouslyAvailableButNew'
          ),
          mockPreviouslyNotAvailable: createMockPackage(
            'mockPreviouslyNotAvailable'
          ),
        },
      };
      result = addDependencies(env) as Env;
      dependencies = result?.packages?.mockPackageUnderTest?.dependsOn ?? [];
    });
    it('has a result', () => {
      expect(result).toBeDefined();
    });
    it('takes the dependency from rlsr.json if it is `*`', () => {
      const found = dependencies.find(
        (dependency) => dependency.name === 'mockPreviouslyAvailable'
      );
      expect(found).toBeDefined();
      expect(found?.range).toEqual('1 - 2');
    });
    it('takes the dependency from package.json if it is defined there', () => {
      const found = dependencies.find(
        (dependency) =>
          dependency.name === 'mockPreviouslyAvailableButOverwritten'
      );
      expect(found).toBeDefined();
      expect(found?.range).toEqual('2 - 3');
    });
    it('keeps the keyword `new` if it is defined', () => {
      const found = dependencies.find(
        (dependency) => dependency.name === 'mockPreviouslyAvailableButNew'
      );
      expect(found).toBeDefined();
      expect(found?.range).toEqual('new');
    });
    it('keeps the `*` if it it is a package that previously did not exist', () => {
      const found = dependencies.find(
        (dependency) => dependency.name === 'mockPreviouslyNotAvailable'
      );
      expect(found).toBeDefined();
      expect(found?.range).toEqual('*');
    });
  });
});
