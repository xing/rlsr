/* eslint-env node, jest */
import type { Env, Module } from '../../types';

import { envWithConfig } from '../../fixtures/env';

// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog, error: mockError }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

// mock Env object
const envWithoutCommitMessages: Env = { ...envWithConfig };
const envWithoutPackages: Env = { ...envWithConfig, commitMessages: [] };

describe('addMessagesToPackages module', () => {
  let addMessagesToPackages: Module;

  beforeAll(() => {
    addMessagesToPackages =
      require('../add-messages-to-packages').addMessagesToPackages;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws an error when "commitMessages" is missing on Env config object', () => {
    const expectedErrorMessage = 'missing "commitMessages" on env object';
    expect(() => addMessagesToPackages(envWithoutCommitMessages)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('throws an error when "packages" is missing on Env config object', () => {
    const expectedErrorMessage = 'missing "packages" on env object';
    expect(() => addMessagesToPackages(envWithoutPackages)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it.todo('throws an error when an invalid "affectedPackage" is registered');

  describe('on run', () => {
    it.todo('returns the right Env config object');
    it.todo('registers "commitMessages" to its affected packages');
    it.todo('no "commitMessages" is registered to unaffected packages');
  });
});
