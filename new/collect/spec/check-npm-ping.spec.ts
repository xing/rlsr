/* eslint-env node, jest */
import type { Env, Module } from "../../types";

const mockEnvBase: Env = { stage: "canary", force: false, appRoot: "/" };
const mockEnvWithRegistry: Env = {
  ...mockEnvBase,
  config: {
    debug: false,
    remote: "",
    branch: "",
    changelogPath: "/",
    metadataPath: "/",
    registry: "https://registry.npmjs.org",
    mode: "independent",
    impact: "full",
    tag: "latest",
    productionBranch: "production",
    betaBranch: "beta",
    mainBranch: "main",
    betaTag: "beta",
  },
};

describe("checkNpmPing", () => {
  const mockModule = jest.fn();
  const commandMock = jest.fn(() => mockModule);
  let checkNpmPing: Module;

  beforeAll(() => {
    jest.mock("../../helpers/command", () => ({
      command: commandMock,
    }));
    checkNpmPing = require("../check-npm-ping").checkNpmPing;
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('is a Module built from "Command"', () => {
    expect(checkNpmPing).toBe(mockModule);
  });

  describe('Builds a "command"', () => {
    let topic: string;
    let cmd: (env: Env) => string;
    let stdOut: string;
    let stdErr: string;

    beforeAll(() => {
      //@ts-ignore
      [topic, cmd, stdOut, stdErr] = commandMock.mock.calls[0];
    });
    it("runs on import", () => {
      expect(commandMock).toBeCalled();
    });

    it("sets the right topic", () => {
      expect(topic).toEqual("check npm ping");
    });
    describe("command", () => {
      it("is a function", () => {
        expect(cmd).toBeInstanceOf(Function);
      });
      it("returns the command with registry as a string when config is present", () => {
        expect(cmd(mockEnvWithRegistry)).toEqual(
          "npm ping --registry=https://registry.npmjs.org"
        );
      });
      it("returns the command with empty registry as a string when config is not present", () => {
        expect(cmd(mockEnvBase)).toEqual("npm ping");
      });
    });
    it('sets the stdOut to "silent"', () => {
      expect(stdOut).toEqual("silent");
    });
    it('sets the stdErr to "inf"', () => {
      expect(stdErr).toEqual("inf");
    });
  });
});
