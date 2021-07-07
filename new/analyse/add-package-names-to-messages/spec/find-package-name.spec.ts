/* eslint-env node, jest */
import { dirname, join } from 'path';
import findUp from 'find-up';
import { readFileSync } from 'fs';

// mock Log
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ error: mockError }));
jest.mock('../../../helpers/logger', () => ({ logger: mockLogger }));

// mock path
jest.mock('path');
const mockDirname = (
  dirname as jest.MockedFunction<typeof dirname>
).mockImplementation();
const mockJoin = (
  join as jest.MockedFunction<typeof join>
).mockImplementation();

// mock find-up
jest.mock('find-up');
const mockFindUpSync = (
  findUp.sync as jest.MockedFunction<typeof findUp.sync>
).mockImplementation();

// mock fs
jest.mock('fs');
const mockReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>;

const mockAppRoot = '/mocked/app/root/';
const mockFilePath = 'path/to/mocked/file.ts';
const mockDirnameResult = '/mocked/app/root/path/to/mocked/';
const mockPackaJsonPath = '/mocked/app/root/path/to/mocked/package.json';
const mockPackageName = 'mockPackageName';

describe('findPackageName helper', () => {
  let findPackageName: (appRoot: string, filePath: string) => string;
  beforeAll(() => {
    findPackageName = require('../find-package-name').findPackageName;
  });
  beforeEach(() => {
    // setup mocks
    mockJoin.mockImplementationOnce(() => mockAppRoot + mockFilePath);

    mockDirname.mockImplementation(() => mockDirnameResult);

    mockFindUpSync.mockImplementation(() => mockPackaJsonPath);

    mockReadFileSync.mockImplementation(
      () => `{ "name": "${mockPackageName}" }`
    );
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns package name correctly', () => {
    // run test
    const result: string = findPackageName(mockAppRoot, mockFilePath);

    // assert
    expect(mockJoin).toHaveBeenCalledTimes(1);
    expect(mockJoin).toHaveBeenCalledWith(mockAppRoot, mockFilePath);
    expect(mockDirname).toHaveBeenCalledTimes(1);
    expect(mockDirname).toHaveBeenCalledWith(mockAppRoot + mockFilePath);

    expect(mockFindUpSync).toHaveBeenCalledTimes(1);
    expect(mockFindUpSync).toHaveBeenCalledWith('package.json', {
      cwd: mockDirnameResult,
    });

    expect(mockReadFileSync).toHaveBeenCalledTimes(1);
    expect(mockReadFileSync).toHaveBeenCalledWith(mockPackaJsonPath, {
      encoding: 'utf8',
    });

    expect(result).toEqual(mockPackageName);
  });

  it('throws an error if no package.json is found', () => {
    mockFindUpSync.mockImplementationOnce(() => undefined);
    expect(() => {
      findPackageName(mockAppRoot, mockFilePath);
    }).toThrow(`No "package.json" found for ${mockFilePath}`);
  });

  it('throws an error if no name is found in package.json', () => {
    mockReadFileSync.mockImplementationOnce(() => '{ }');
    expect(() => {
      findPackageName(mockAppRoot, mockFilePath);
    }).toThrow(`${mockPackaJsonPath} has no "name" property`);
  });
});
