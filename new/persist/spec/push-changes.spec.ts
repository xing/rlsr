/* eslint-env node, jest */
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

const mockPull = jest.fn();
const mockPush = jest.fn();
const mockPushTags = jest.fn();

// mock SingleGit
const mockSimpleGit = jest.fn(() => ({
  pull: mockPull,
  push: mockPush,
  pushTags: mockPushTags,
}));
jest.mock('simple-git', () => mockSimpleGit);

import { envWithConfig } from '../../fixtures/env';
import { pushChanges } from '../push-changes';

describe('pushChanges Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an exeption when changes cannot be pulled', async () => {
    mockPull.mockRejectedValue(new Error());

    await expect(pushChanges(envWithConfig)).rejects.toThrow();

    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(mockLoggerError).toHaveBeenCalledWith('Error pulling changes');
  });

  it('throws an exeption when changes cannot be pushed', async () => {
    mockPull.mockResolvedValue(envWithConfig);
    mockPush.mockRejectedValue(new Error());
    await expect(pushChanges(envWithConfig)).rejects.toThrow();

    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(mockLoggerError).toHaveBeenCalledWith('Error pushing changes');
  });

  it('succesfully pushes changes', async () => {
    mockPull.mockResolvedValue(envWithConfig);
    mockPush.mockResolvedValue(envWithConfig);
    await pushChanges(envWithConfig);

    expect(mockPull).toBeCalledTimes(1);
    expect(mockPush).toBeCalledTimes(1);
    expect(mockPushTags).toBeCalledTimes(1);
  });
});
