// mock Logger
const mockLog = jest.fn();
const mockLoggerError = jest.fn();

const mockLogger = jest.fn(() => ({
  error: mockLoggerError,
  log: mockLog,
}));

jest.mock('../../helpers/logger', () => ({
  logger: mockLogger,
}));

const mockAdd = jest.fn();
const mockCommit = jest.fn();
const mockAddTag = jest.fn();

// mock SingleGit
const mockSimpleGit = jest.fn(() => ({
  add: mockAdd,
  commit: mockCommit,
  addTag: mockAddTag,
}));
jest.mock('simple-git', () => mockSimpleGit);

import { envWithConfig } from '../../fixtures/env';
import { Env, Package, PackageAfterPrepareChangelogs } from '../../types';
import { commitAndTagPackages } from '../commit-and-tag-packages';

// mock Packages
const mockPackageBuilder = (
  id: number,
  version: string
): Package | PackageAfterPrepareChangelogs => ({
  currentVersion: '1.0.0',
  path: `mock/path/to/package_${id}/`,
  packageJson: { name: `mock${id}Package` },
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: 1,
  dependingOnThis: [],
  dependsOn: [],
  incrementedVersion: version,
});

const mockEnv: Env = {
  ...envWithConfig,
  packages: {
    mock1Package: mockPackageBuilder(1, '1.1.1'),
    mock2Package: mockPackageBuilder(2, '2.2.2'),
  },
};

describe('commitAndTagPackages Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an exeption when changes cannot be committed', async () => {
    mockCommit.mockRejectedValue(new Error());

    await expect(commitAndTagPackages(mockEnv)).rejects.toThrow();

    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Error while staging the changes'
    );
  });

  it('succesfully commits changes', async () => {
    mockCommit.mockResolvedValue(mockEnv);
    await commitAndTagPackages(mockEnv);

    expect(mockAdd).toBeCalledTimes(1);
    expect(mockCommit).toBeCalledTimes(1);
    expect(mockAddTag).toBeCalledTimes(2);
  });

  it('returns the same env object', async () => {
    expect(await commitAndTagPackages(mockEnv)).toEqual(mockEnv);
  });
});
