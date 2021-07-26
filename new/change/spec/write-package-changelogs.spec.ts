import { envWithConfig } from '../../fixtures/env';
import type { Module } from '../../types';
// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog, error: mockError }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

describe('writePackageChangelogs Module', () => {
  let writePackageChangelogs: Module;

  beforeAll(() => {
    writePackageChangelogs =
      require('../write-package-changelogs').writePackageChangelogs;
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

  it.todo('writes package changelogs');
});
