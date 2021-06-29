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

jest.mock('../../helpers/compose-async', () => ({
  composeAsync: mockComposeAsync,
}));
jest.mock('../../helpers/wait-module', () => ({ wait: mockWait }));
jest.mock('../../helpers/log-module', () => ({ log: mockLog }));
jest.mock('../add-dependencies', () => ({
  addDependencies: mockAddDependencies,
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

  // Aditional tests
  test(`exports "composeAsync"'s result as "collect"`, () => {
    expect(result).toBe(mockComposeAsyncResult);
  });
});
