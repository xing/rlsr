import { envWithConfig } from "../../fixtures/env";
import { Config, Env } from "../../types";
import { checkGitStatus, exitCodes } from "../check-git-status";
import { defaultConfig as collectConfig } from "../config";

/* eslint-env node, jest */
describe("checkGitStatus Module", () => {
  let mockExit: jest.SpyInstance;

  beforeAll(() => {
    mockExit = jest.spyOn(process, "exit").mockImplementation();
  });

  beforeEach(() => {
    //removing log output for sanity reasons
    jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => {
    mockExit.mockReset();
  });

  it("exists the process when there are uncommitted files", async (done) => {
    const env: Env = { ...envWithConfig, uncommittedFiles: ["foo"] };
    await checkGitStatus(env);
    expect(mockExit).toHaveBeenCalledWith(exitCodes.UNCOMMITTED);
    done();
  });

  describe("on Verify", () => {
    const config: Config = { ...collectConfig, impact: "verify" };
    const env: Env = {
      ...envWithConfig,
      uncommittedFiles: ["foo"],
      config,
    };
    let result: Env;
    beforeAll(async () => {
      result = await checkGitStatus(env);
    });
    it("does not exit when mode is verify", () => {
      expect(mockExit).not.toHaveBeenCalled();
    });
    it("returns an untouched Env object", () => {
      expect(result).toEqual(env);
    });
  });

  it("exit when not beta branch", async (done) => {
    const env: Env = { ...envWithConfig, stage: "beta", currentBranch: "foo" };
    await checkGitStatus(env);
    expect(mockExit).toHaveBeenCalledWith(exitCodes.WRONG_BRANCH);
    done();
  });
  it("does not exit when beta branch", async (done) => {
    const env: Env = {
      ...envWithConfig,
      stage: "beta",
      currentBranch: "master",
    };
    await checkGitStatus(env);
    expect(mockExit).not.toHaveBeenCalledWith(exitCodes.WRONG_BRANCH);
    done();
  });
  it("exit when not production branch", async (done) => {
    const env: Env = {
      ...envWithConfig,
      stage: "production",
      currentBranch: "foo",
    };
    await checkGitStatus(env);
    expect(mockExit).toHaveBeenCalledWith(exitCodes.WRONG_BRANCH);
    done();
  });
  it("does not exit when production branch", async (done) => {
    const env: Env = {
      ...envWithConfig,
      stage: "production",
      currentBranch: "master",
    };
    await checkGitStatus(env);
    expect(mockExit).not.toHaveBeenCalledWith(exitCodes.WRONG_BRANCH);
    done();
  });
});
