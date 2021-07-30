/* eslint-env node, jest */
import { clone } from 'ramda';

import type { Env, Message, Module } from '../../../types';
import { envWithConfig } from '../../../fixtures/env';

// mock Log
const mockError = jest.fn();
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog, error: mockError }));
jest.doMock('../../../helpers/logger', () => ({ logger: mockLogger }));

// mock findPackageName
const mockFindPackageName = jest.fn((_appRoot, filePath: string) => {
  // return "package_X" as package name
  return filePath.match(/mock\/path\/to\/(package_\d+)\/file_\d+.js/)![1];
});
jest.doMock('../find-package-name', () => ({
  findPackageName: mockFindPackageName,
}));

const messageFactory: (id: number) => Message = (id: number) => ({
  hash: `mockHash ${id}`,
  date: `mockDate ${id}`,
  message: `mockMessage ${id}`,
  body: `mockBody ${id}`,
  text: `text ${id}`,
  level: 'patch',
  committedFiles: [
    `mock/path/to/package_${id}/file_1.js`,
    `mock/path/to/package_${id}/file_2.js`,
    `mock/path/to/package_${id}/file_3.js`,
  ],
});

describe('addPackageNamesToMessages Module', () => {
  let addPackageNamesToMessages: Module;

  beforeAll(() => {
    addPackageNamesToMessages =
      require('../add-package-names-to-messages').addPackageNamesToMessages;
  });

  it('throws an exception if env config object has no "commitMessages"', () => {
    const expectedErrorMessage = 'missing "commitMessages" on env object';
    expect(() => addPackageNamesToMessages(envWithConfig)).toThrow(
      expectedErrorMessage
    );
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('populates packageNames on env messages', () => {
    const mockEnv: Env = {
      ...envWithConfig,
      commitMessages: [messageFactory(1), messageFactory(2), messageFactory(3)],
    };
    const result = addPackageNamesToMessages(mockEnv);

    const expectedEnv = clone(mockEnv);
    expectedEnv.commitMessages![0].affectedPackages = ['package_1'];
    expectedEnv.commitMessages![1].affectedPackages = ['package_2'];
    expectedEnv.commitMessages![2].affectedPackages = ['package_3'];
    expect(result).toEqual(expectedEnv);
  });
});
