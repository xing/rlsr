/* eslint-env node, jest */
// This prevents re-declaration warnings
// @SEE: https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {};

const mockComposeAsyncResult = 'Compose Async Result';
const mockComposeAsync = jest.fn(() => mockComposeAsyncResult);
const mockWaitResult = 'mock Wait Result';
const mockWait = jest.fn(() => mockWaitResult);
const mockLogResult = jest.fn();
const mockLog = jest.fn(() => mockLogResult);
const mockAddDependencies = jest.fn();
const mockExtendDependencyRanges = jest.fn();
const mockCreateDependencyTree = jest.fn();
const mockAddPackageNamesToMessages = jest.fn();
const mockAddMessagesToPackages = jest.fn();
const mockDetermineDirectIncrement = jest.fn();
const mockDetermineVersion = jest.fn();
const mockAdaptDependencies = jest.fn();

jest.mock('../../helpers/compose-async', () => ({
  composeAsync: mockComposeAsync,
}));
jest.mock('../../helpers/wait-module', () => ({ wait: mockWait }));
jest.mock('../../helpers/log-module', () => ({ log: mockLog }));
jest.mock('../add-dependencies', () => ({
  addDependencies: mockAddDependencies,
}));
jest.mock('../extend-dependency-ranges', () => ({
  extendDependencyRanges: mockExtendDependencyRanges,
}));
jest.mock('../create-dependency-tree', () => ({
  createDependencyTree: mockCreateDependencyTree,
}));
jest.mock('../add-package-names-to-messages', () => ({
  addPackageNamesToMessages: mockAddPackageNamesToMessages,
}));
jest.mock('../add-messages-to-packages', () => ({
  addMessagesToPackages: mockAddMessagesToPackages,
}));
jest.mock('../determine-direct-increment', () => ({
  determineDirectIncrement: mockDetermineDirectIncrement,
}));
jest.mock('../determine-version', () => ({
  determineVersion: mockDetermineVersion,
}));
jest.mock('../adapt-dependencies', () => ({
  adaptDependencies: mockAdaptDependencies,
}));

describe("analyse's Index", () => {
  let result: typeof mockComposeAsyncResult;
  beforeAll(() => {
    result = require('../index').analyse;
  });

  // Test Steps' order
  test('composeAsync is called once', () => {
    expect(mockComposeAsync).toBeCalledTimes(1);
  });

  test('1. logs a description', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][0]).toBe(mockLogResult);
    expect(mockLog).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith(
      'ANALYSE PHASE: Looking at what needs to be changed'
    );
  });

  test("2. populates package's dependencies", () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][1]).toBe(mockAddDependencies);
  });

  test("3. extend package's dependencies ranges", () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][2]).toBe(mockExtendDependencyRanges);
  });

  test("4. creates package's dependencies tree", () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][3]).toBe(mockCreateDependencyTree);
  });

  test('5. add package names to messages', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][4]).toBe(
      mockAddPackageNamesToMessages
    );
  });

  test('6. adds messages to packages', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][5]).toBe(mockAddMessagesToPackages);
  });

  test('7. determine direct increment', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][6]).toBe(
      mockDetermineDirectIncrement
    );
  });

  test('8. determine version (first run)', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][7]).toBe(mockDetermineVersion);
  });

  test('9. adapt dependencies', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][8]).toBe(mockAdaptDependencies);
  });

  test('10. determine version (second run)', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][9]).toBe(mockDetermineVersion);
  });

  test('calls "wait(1000)" at the end', () => {
    const lastComposeArgument =
      mockComposeAsync.mock.calls[0][mockComposeAsync.mock.calls[0].length - 1];
    expect(mockWait).toHaveBeenCalledTimes(1);
    expect(mockWait).toHaveBeenCalledWith(1000);
    expect(lastComposeArgument).toBe(mockWaitResult);
  });

  // Aditional tests
  test(`exports "composeAsync"'s result as "collect"`, () => {
    expect(result).toBe(mockComposeAsyncResult);
  });
});
