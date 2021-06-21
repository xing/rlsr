import type { Env } from "../../types";

// Chalk Mocks
const mockBold = jest.fn((text) => `bold(${text})`);
const mockYellow = jest.fn((text) => `yellow(${text})`);

jest.mock("chalk", () => ({
  bold: mockBold,
  yellow: mockYellow,
}));

// Logger Mocks
const mockLog = jest.fn();
const mockDebug = jest.fn();
const mockLogger = jest.fn(() => ({
  debug: mockDebug,
  log: mockLog,
}));

jest.mock("../../helpers/logger", () => ({
  logger: mockLogger,
}));

describe.each`
  stage           | verify   | dryrun   | pkgName          | appRoot
  ${"canary"}     | ${true}  | ${false} | ${undefined}     | ${"/"}
  ${"beta"}       | ${false} | ${true}  | ${"testPackage"} | ${"/"}
  ${"production"} | ${false} | ${false} | ${"testPackage"} | ${"/"}
`(
  "Start Report Module (stage: $stage, verify: $verify, dryrun: $dryrun, pkgName: $pkgName, appRoot: $appRoot)",
  ({ stage, verify, dryrun, pkgName, appRoot }) => {
    let startReport;
    let result: Env;
    let mockEnv: Env;
    beforeAll(() => {
      mockEnv = {
        stage,
        verify,
        dryrun,
        appRoot,
        pkg: { name: pkgName },
        force: false,
      };
      startReport = require("../start-report").startReport;
      result = startReport(mockEnv);
    });
    afterAll(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });

    it("sets up the right logger", () => {
      expect(mockLogger).toHaveBeenCalled();
      expect(mockLogger).toHaveBeenNthCalledWith(1, "report");
    });

    it("logs a welcome message ", () => {
      expect(mockYellow).toHaveBeenNthCalledWith(1, stage);
      expect(mockBold).toHaveBeenCalledTimes(1);
      expect(mockBold).toHaveBeenCalledWith(`yellow(${stage})`);
      expect(mockLog).toHaveBeenNthCalledWith(
        1,
        `Running in stage bold(yellow(${stage}))`
      );
    });

    if (verify) {
      it('logs a "verify" message', () => {
        expect(mockLog).toHaveBeenNthCalledWith(2, "verifying status only!");
      });
    } else if (dryrun) {
      it('logs "dryrun" message', () => {
        expect(mockLog).toHaveBeenNthCalledWith(2, "dryrun only!");
      });
    }

    it(`logs project name "${pkgName ?? "unknown"}"`, () => {
      const logCount = !verify && !dryrun ? 2 : 3;
      expect(mockYellow).toHaveBeenNthCalledWith(2, pkgName ?? "unknown");
      expect(mockLog).toHaveBeenNthCalledWith(
        logCount,
        `project: yellow(${pkgName ?? "unknown"})`
      );
    });

    it("debugs root folder", () => {
      expect(mockYellow).toHaveBeenNthCalledWith(3, appRoot);
      expect(mockDebug).toHaveBeenNthCalledWith(
        1,
        `root folder: yellow(${appRoot})`
      );
    });

    it("returns the env object back", () => {
      expect(result).toBe(mockEnv);
    });
  }
);
