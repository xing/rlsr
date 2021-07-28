import { envWithConfig } from '../../fixtures/env';
import type { Module, Env } from '../../types';
import fs from 'fs';

// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog, error: mockError }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

jest.mock('fs');

const mockEnv: Env = {
  ...envWithConfig,
  newStatus: {
    lastReleaseHash: 'newhash',
    packages: {
      package1: {
        version: '1.0.0',
        dependencies: {
          package2: { name: 'package2', range: '1-2', type: 'default' },
        },
      },
      package2: { version: '1.0.0', dependencies: {} },
    },
  },
};

describe('writeRlsrJson Module', () => {
  let writeRlsrJson: Module;

  console.log('top describe');

  beforeAll(() => {
    writeRlsrJson = require('../write-rlsr-json').writeRlsrJson;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error when rlsrJson content (newStatus) is not set up', () => {
    const expectedErrorMessage =
      'the data for rlsr.json seems not to be calculated';
    expect(() => writeRlsrJson(envWithConfig)).toThrow(expectedErrorMessage);
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expectedErrorMessage);
  });

  it('writes the file', () => {
    writeRlsrJson(mockEnv);

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  });
});
