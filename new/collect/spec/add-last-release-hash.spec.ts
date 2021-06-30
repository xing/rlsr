/* eslint-env node, jest */
import type { Env, Module } from '../../types';

// mock Chalk
const mockYellow = jest.fn((text) => `yellow(${text})`);
jest.mock('chalk', () => ({ yellow: mockYellow }));

// mock Logger
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({
  error: mockError,
  log: mockLog,
}));
jest.mock('../../helpers/logger', () => ({
  logger: mockLogger,
}));

const { envWithConfig } = require('../../fixtures/env');
const mockHash = '7ec3f9525cf2c2cd9c63836b7a71fb0092c02657';
const mockRlsrConfig = {
  versions: {},
  lastReleaseHash: mockHash,
  releaseTag: 'release',
};
const mockRlsrConfigFirstRelease = {
  versions: {},
  releaseTag: 'release',
};

describe('addLastReleaseHash Module', () => {
  let addLastReleaseHash: Module;

  beforeAll(() => {
    addLastReleaseHash = require('../add-last-release-hash').addLastReleaseHash;
  });

  it('throws an exception when no rlsr.json config file is present', async () => {
    const mockEnv = {
      ...envWithConfig,
      currentBranch: 'master',
      tagsInTree: [],
      status: undefined,
    };

    await expect(addLastReleaseHash(mockEnv)).rejects.toThrow(
      'Missing rlsr.json config file'
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith('Missing rlsr.json config file');
  });

  describe.each`
    scenario                             | rlsrConfig                    | tagsInTree                               | currentBranch   | expectation
    ${'hash on rlsr.json file'}          | ${mockRlsrConfig}             | ${['release@3.0', '2.0.0', '1.0.0']}     | ${'master'}     | ${mockHash}
    ${"first project's release"}         | ${mockRlsrConfigFirstRelease} | ${[]}                                    | ${'production'} | ${undefined}
    ${'release tag on release tree'}     | ${mockRlsrConfigFirstRelease} | ${['release@3.0', '2.0.0', '1.0.0']}     | ${'master'}     | ${'release@3.0'}
    ${'release tag not on release tree'} | ${mockRlsrConfigFirstRelease} | ${['2.0.0', 'publicacion@3.0', '1.0.0']} | ${'master'}     | ${undefined}
  `('$scenario', ({ rlsrConfig, tagsInTree, currentBranch, expectation }) => {
    let mockEnv: Env;
    let result: Env;
    beforeEach(async () => {
      mockEnv = {
        ...envWithConfig,
        currentBranch,
        tagsInTree,
        status: rlsrConfig,
      };
      result = await addLastReleaseHash(mockEnv);
    });
    it(`returns an Env object with its "lastReleaseHash" = ${expectation}`, async () => {
      expect(result).toEqual({
        ...mockEnv,
        lastReleaseHash: expectation,
      });
    });
  });
});
