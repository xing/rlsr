import type { Env, Module } from "../../types";

const mockEnv: Env = { stage: "canary", force: false, appRoot: "/" };

type buildPRomiseType = <Type>(result: Type) => Promise<Type>;
const buildPromise: buildPRomiseType = (result) =>
  new Promise((resolve) => resolve(result));

const mockedFilesPaths = ["/", "/package.json"];
// @TODO: Add Test cases for different tags
const mockTag = ["v0.2.0", "v2.0.0", "v3.1.0"];

describe.each`
  testCase | statusCurrent   | statusFilesPaths    | tags       | logHash
  ${1}     | ${"production"} | ${mockedFilesPaths} | ${mockTag} | ${"a046014605018446ec2a77beb2024d283ac27447"}
  ${2}     | ${"production"} | ${mockedFilesPaths} | ${mockTag} | ${undefined}
`(
  "add-git-status - test case $testCase",
  ({ statusCurrent, statusFilesPaths, tags, logHash }) => {
    let addGitStatus: Module;
    let result: Env;
    let sortSemverSpy: jest.SpyInstance;

    const mockSimpleGit = jest.fn();
    const mockStatus = jest.fn();
    const mockLog = jest.fn();
    const mockTags = jest.fn();
    const mockTag = jest.fn();

    beforeAll(async () => {
      // simple-git Mocks
      mockStatus.mockImplementation(() =>
        buildPromise({
          current: statusCurrent,
          files: statusFilesPaths.map((path: string) => ({ path })),
        })
      );

      mockLog.mockImplementation(() =>
        buildPromise(logHash ? { latest: { hash: logHash } } : {})
      );

      mockTags.mockImplementation(() => buildPromise(semverSortedTags));
      mockTag.mockImplementation(() => buildPromise(tags.join("\n")));

      const semverSortedTags = { all: tags };
      mockSimpleGit.mockImplementation(() => ({
        status: mockStatus,
        log: mockLog,
        tags: mockTags,
        tag: mockTag,
      }));
      jest.mock("simple-git", () => mockSimpleGit);

      // sort-semver Mocks
      sortSemverSpy = jest.spyOn(
        require("../../helpers/sort-semver"),
        "sortSemver"
      );

      addGitStatus = require("../add-git-status").addGitStatus;
      result = await addGitStatus(mockEnv);
    });

    afterAll(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });

    it("uses singleGit", () => {
      expect(mockSimpleGit).toHaveBeenCalledTimes(1);
    });

    it("uses singleGit's log() method", () => {
      expect(mockLog).toHaveBeenCalledTimes(1);
    });

    it("uses singleGit's tags() method", () => {
      expect(mockTags).toHaveBeenCalledTimes(1);
    });

    it("uses singleGit's tag() method", () => {
      expect(mockTag).toHaveBeenCalledTimes(1);
      expect(mockTag).toHaveBeenCalledWith(["--merged"]);
    });

    it("sorts tags", () => {
      expect(sortSemverSpy).toHaveBeenCalledTimes(tags.length - 1);
    });

    describe("its Env return object", () => {
      it("contains the orginal Env's attributes received as parameter", () => {
        expect(result).toMatchObject(mockEnv);
      });
      it('contains "allTags" property', () => {
        const expected = Array.from(tags).reverse();
        expect(result.allTags).toEqual(expected);
      });
      it('contains "currentBranch" property', () => {
        expect(result.currentBranch).toEqual(statusCurrent);
      });
      it('contains "currentHash" property', () => {
        expect(result.currentHash).toEqual(logHash);
      });
      it('contains "tagsInTree" property', () => {
        const expected = Array.from(tags).reverse();
        expect(result.tagsInTree).toEqual(expected);
      });
      it('contains "uncommittedFiles" property', () => {
        expect(result.uncommittedFiles).toEqual(statusFilesPaths);
      });
    });
  }
);
