const composeAsyncResult = 'Compose Async Result';
const mockComposeAsync = jest.fn(() => composeAsyncResult);
const mockWaitResult = 'mock Wait Result';
const mockWait = jest.fn(() => mockWaitResult);
const mockLogResult = jest.fn();
const mockLog = jest.fn(() => mockLogResult);
const mockConfig = jest.fn();
const mockMainPackage = jest.fn();
const mockStartReport = jest.fn();
const mockWhenNotDryrunResult = jest.fn();
const mockWhenNotDryrun = jest.fn(() => mockWhenNotDryrunResult);
// @TODO: Name this results properly
const mockWhenNotStageResultResult = jest.fn();
const mockWhenNotStageResult = jest.fn(() => mockWhenNotStageResultResult);
const mockWhenNotStage = jest.fn(() => mockWhenNotStageResult);
const mockCheckNpmPing = jest.fn();
const mockCheckNpmLogin = jest.fn();
const mockAddGitStatus = jest.fn();
const mockCheckGitStatus = jest.fn();
const mockReadStatusFile = jest.fn();
const mockAddLastReleaseHash = jest.fn();
const mockAddRawCommitMessages = jest.fn();
const mockParseCommitMessages = jest.fn();
const mockAddFilesToCommitMessages = jest.fn();
const mockAddAllPackageJsons = jest.fn();
const mockAddMainNotes = jest.fn();

jest.mock('../../helpers/compose-async', () => ({
  composeAsync: mockComposeAsync,
}));
jest.mock('../../helpers/wait-module', () => ({ wait: mockWait }));
jest.mock('../../helpers/log-module', () => ({ log: mockLog }));
jest.mock('../config', () => ({ config: mockConfig }));
jest.mock('../main-package', () => ({ mainPackage: mockMainPackage }));
jest.mock('../start-report', () => ({ startReport: mockStartReport }));
jest.mock('../../helpers/when', () => ({
  whenNotDryrun: mockWhenNotDryrun,
  whenNotStage: mockWhenNotStage,
}));
jest.mock('../check-npm', () => ({
  checkNpmPing: mockCheckNpmPing,
  checkNpmLogin: mockCheckNpmLogin,
}));
jest.mock('../add-git-status', () => ({ addGitStatus: mockAddGitStatus }));
jest.mock('../check-git-status', () => ({
  checkGitStatus: mockCheckGitStatus,
}));
jest.mock('../read-status-file', () => ({
  readStatusFile: mockReadStatusFile,
}));
jest.mock('../add-last-release-hash', () => ({
  addLastReleaseHash: mockAddLastReleaseHash,
}));
jest.mock('../add-raw-commit-messages', () => ({
  addRawCommitMessages: mockAddRawCommitMessages,
}));
jest.mock('../parse-commit-messages', () => ({
  parseCommitMessages: mockParseCommitMessages,
}));
jest.mock('../add-files-to-commit-messages', () => ({
  addFilesToCommitMessages: mockAddFilesToCommitMessages,
}));
jest.mock('../add-all-package-jsons', () => ({
  addAllPackageJsons: mockAddAllPackageJsons,
}));
jest.mock('../add-main-notes', () => ({
  addMainNotes: mockAddMainNotes,
}));

describe("collect's Index", () => {
  let result: typeof composeAsyncResult;
  beforeAll(() => {
    result = require('../index').collect;
  });

  // Test Steps' order
  test('composeAsync is called once', () => {
    expect(mockComposeAsync).toBeCalledTimes(1);
  });

  test('1. logs a description', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][0]).toBe(mockLogResult);
    expect(mockLog).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith('COLLECT PHASE: gathering all data');
  });

  test('2. reads config', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][1]).toBe(mockConfig);
  });

  test('3. pings NPM registry', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][2]).toBe(mockWhenNotDryrunResult);
    expect(mockWhenNotDryrun).toHaveBeenNthCalledWith(1, mockCheckNpmPing);
  });

  test('4. checks NPM login status', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][3]).toBe(mockWhenNotDryrunResult);
    expect(mockWhenNotDryrun).toHaveBeenNthCalledWith(2, mockCheckNpmLogin);
  });

  test('5. adds main package.json to Env config object', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][4]).toBe(mockMainPackage);
  });

  test('6. prints some useful status message', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][5]).toBe(mockStartReport);
  });

  test('7. adds git info to Env config object', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][6]).toBe(mockAddGitStatus);
  });

  test('8. checks for uncommitted files', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][7]).toBe(
      mockWhenNotStageResultResult
    );
    expect(mockWhenNotStage).toHaveBeenCalledWith('canary');
    expect(mockWhenNotStageResult).toHaveBeenCalledWith(mockCheckGitStatus);
  });

  test('9. adds status data from rlsr.json to Env config object', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][8]).toBe(mockReadStatusFile);
  });

  test("10. adds last release's hash to Env config object", () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][9]).toBe(mockAddLastReleaseHash);
  });

  test('11. adds commit messages since last release to Env config object', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][10]).toBe(mockAddRawCommitMessages);
  });

  test('12. adds parsed commit messages since last release to Env config object', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][11]).toBe(mockParseCommitMessages);
  });

  test('13. adds files to commit messages', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][12]).toBe(
      mockAddFilesToCommitMessages
    );
  });
  test('14. adds all package.json to Env config file', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][13]).toBe(mockAddAllPackageJsons);
  });
  test('15. adds main release notes to Env config file', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][14]).toBe(mockAddMainNotes);
  });
  test('16. waits for a second', () => {
    // @ts-ignore
    expect(mockComposeAsync.mock.calls[0][15]).toBe(mockWaitResult);
  });

  // Aditional tests
  test(`exports "composeAsync"'s result as "collect"`, () => {
    expect(result).toBe(composeAsyncResult);
  });

  test('whenNotDryrun is called only twice', () => {
    expect(mockWhenNotDryrun).toHaveBeenCalledTimes(2);
  });
  test('mockWhenNotStage is called only once', () => {
    expect(mockWhenNotStage).toHaveBeenCalledTimes(1);
  });
  test('mockWhenNotStageResult is called only once', () => {
    expect(mockWhenNotStageResult).toHaveBeenCalledTimes(1);
  });
});
