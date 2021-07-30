/* eslint-env node, jest */

import { clone } from 'ramda';

import { envWithConfig } from '../../fixtures/env';
import type { Env, Message, Module, Package } from '../../types';

// mock chalk
const mockGreen = jest.fn();
const mockRed = jest.fn();
const mockYellow = jest.fn();
const mockWhite = jest.fn();
jest.doMock('chalk', () => ({
  green: mockGreen,
  red: mockRed,
  yellow: mockYellow,
  white: mockWhite,
}));

// mock logger
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({
  error: mockError,
  log: mockLog,
}));
jest.doMock('../../helpers/logger', () => ({
  logger: mockLogger,
}));

// mock Packages
const mockPackageBuilder = (id: number): Package => ({
  currentVersion: '1.0.0',
  path: `mock/path/to/package_${id}/`,
  packageJson: { name: `mock${id}Package` },
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: -1,
  dependingOnThis: [],
  dependsOn: [],
});

const messageFactory = (id: number, level: Message['level']): Message => ({
  hash: `mockHash ${id}`,
  date: `mockDate ${id}`,
  message: `mockMessage ${id}`,
  body: `mockBody ${id}`,
  text: `text ${id}`,
  level,
  committedFiles: [
    `mock/path/to/package_${id}/file_1.js`,
    `mock/path/to/package_${id}/file_2.js`,
    `mock/path/to/package_${id}/file_3.js`,
  ],
  affectedPackages: [`mock${id}Package`],
});

const mockEnvPackages: Env['packages'] = {
  mock1Package: mockPackageBuilder(1),
  mock2Package: mockPackageBuilder(2),
  mock3Package: mockPackageBuilder(3),
  mock4Package: mockPackageBuilder(4),
};
const mockCommitMessages: Env['commitMessages'] = [
  messageFactory(1, 'misc'),
  messageFactory(2, 'patch'),
  messageFactory(3, 'minor'),
  messageFactory(4, 'major'),
];

describe('determineDirectIncrement Module', () => {
  let determineDirectIncrement: Module;
  beforeAll(() => {
    determineDirectIncrement =
      require('../determine-direct-increment').determineDirectIncrement;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws an error if "commitMessage" is not present on env Config Object', () => {
    const expectedError = '"commitMessage" not present on env config object.';
    const mockEnv: Env = { ...envWithConfig };

    expect(() => determineDirectIncrement(mockEnv)).toThrow(expectedError);

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedError);
  });

  it('throws an error if "packages" is not present on env Config Object', () => {
    const expectedError = '"packages" not present on env config object.';
    const mockEnv: Env = { ...envWithConfig, commitMessages: [] };

    expect(() => determineDirectIncrement(mockEnv)).toThrow(expectedError);

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedError);
  });

  describe('on run', () => {
    let result: Env;
    const mockEnv: Env = {
      ...envWithConfig,
      packages: mockEnvPackages,
      commitMessages: mockCommitMessages,
    };
    const expectedEnv: Env = clone(mockEnv);
    const { mock1Package, mock2Package, mock3Package, mock4Package } =
      expectedEnv.packages!;
    beforeAll(() => {
      mock1Package.determinedIncrementLevel = -1;
      mock2Package.determinedIncrementLevel = 0;
      mock3Package.determinedIncrementLevel = 1;
      mock4Package.determinedIncrementLevel = 2;

      result = determineDirectIncrement(mockEnv) as Env;
    });
    it('returns the right env config file', () => {
      expect(result).toEqual(expectedEnv);
    });
    // more specific checks
    it('registers "misc" increment level correctly', () => {
      expect(mock1Package.determinedIncrementLevel).toBe(-1);
    });
    it('registers "patch" increment level correctly', () => {
      expect(mock2Package.determinedIncrementLevel).toBe(0);
    });
    it('registers "minor" increment level correctly', () => {
      expect(mock3Package.determinedIncrementLevel).toBe(1);
    });
    it('registers "major" increment level correctly', () => {
      expect(mock4Package.determinedIncrementLevel).toBe(2);
    });
  });
});
