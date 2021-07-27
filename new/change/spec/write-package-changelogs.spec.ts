import { envWithConfig } from '../../fixtures/env';
import type {
  Module,
  Env,
  PackageAfterPrepareChangelogs,
  Package,
} from '../../types';
import fs from 'fs';

// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog, error: mockError }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

jest.mock('fs');

const changelogMock = (version: string) => ({
  [version]: [
    {
      message: 'mockMessage',
      hash: 'mockHash',
    },
  ],
});

// mock Packages
const mockPackageBuilder = (
  id: number,
  version: string
): Package | PackageAfterPrepareChangelogs => ({
  path: `mock/path/to/package_${id}/`,
  packageJson: { name: `mock${id}Package` },
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: 1,
  dependingOnThis: [],
  dependsOn: [],
  incrementedVersion: version,
  changelogs: changelogMock(version),
});

const mockEnv: Env = {
  ...envWithConfig,
  packages: {
    mockPackage: mockPackageBuilder(1, '1.1.1'),
  },
};

describe('writePackageChangelogs Module', () => {
  let writePackageChangelogs: Module;

  beforeAll(() => {
    writePackageChangelogs =
      require('../write-package-changelogs').writePackageChangelogs;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error when "packages" is missing on Env config object', () => {
    const expectedErrorMessage =
      '"packages" attribute not found on env config object';

    expect(() => writePackageChangelogs(envWithConfig)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('writes package changelog with the correct content', () => {
    const mockPackage = mockEnv.packages!.mockPackage;

    const expectedChangelogPath = `${mockPackage.path}changelog.json`;
    const expectedChangelogContent = JSON.stringify(
      (mockPackage as PackageAfterPrepareChangelogs).changelogs,
      null,
      2
    );

    writePackageChangelogs(mockEnv);

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expectedChangelogPath,
      expectedChangelogContent
    );
  });
});
