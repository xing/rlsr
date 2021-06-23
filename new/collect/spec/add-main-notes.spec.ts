/* eslint-env node, jest */

import type { Env, Module } from "../../types";
import { envWithConfig } from "../../fixtures/env";

const mockFilesBuilder = (id: number) => ({
  id,
  path: `path/to/package_${id}`,
  pkg: { name: `package_${id}` },
  releaseNoteMd: `mock MD Files ${id}`,
});
const mockFiles = [mockFilesBuilder(1), mockFilesBuilder(2)];

// mock fs
const mockReadFileSync = jest.fn((path: string) => {
  const result = mockFiles.find((file) => path.startsWith(file.path))!;
  return path.endsWith(".md")
    ? result.releaseNoteMd
    : JSON.stringify(result.pkg);
});
jest.doMock("fs", () => ({ readFileSync: mockReadFileSync }));

// mock path
const mockDirname = jest.fn((releaseNotePath) =>
  releaseNotePath.replace("/release-notes.md", "")
);
const mockJoin = jest.fn((...paths) => `${paths.join("/")}`);
jest.doMock("path", () => ({ dirname: mockDirname, join: mockJoin }));

// mock Glob
const mockReleaseNotesPaths: string[] = mockFiles.map(
  (file) => `${file.path}/release-notes.md`
);
const mockSync = jest.fn(() => mockReleaseNotesPaths);
jest.doMock("glob", () => ({ sync: mockSync }));

// mock Logger
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog }));
jest.doMock("../../helpers/logger", () => ({ logger: mockLogger }));

// mock Chalk
const mockYellow = jest.fn((text) => `yellow(${text})`);
jest.doMock("chalk", () => ({ yellow: mockYellow }));

describe("addMainNotes Module", () => {
  let addMainNotes: Module;
  beforeAll(() => {
    addMainNotes = require("../add-main-notes").addMainNotes;
  });

  it("sets up logger", () => {
    expect(mockLogger).toHaveBeenCalledTimes(1);
    expect(mockLogger).toHaveBeenCalledWith("add release notes");
  });

  describe("when used", () => {
    let result: Env;
    beforeAll(() => {
      result = addMainNotes(envWithConfig) as Env;
    });

    it("logs introduction", () => {
      expect(mockLog).toHaveBeenNthCalledWith(1, "Search release notes");
    });

    it("uses the right golb pattern for release-notes.md", () => {
      expect(mockSync).toHaveBeenCalledTimes(1);
      expect(mockSync).toHaveBeenCalledWith(
        `${envWithConfig.appRoot}/!(node_modules)/**/release-notes.md`
      );
    });

    describe.each(mockFiles)("iterates over file %#", ({ id, path, pkg }) => {
      it("uses path.dirname to determine the package path", () => {
        expect(mockDirname).toHaveBeenNthCalledWith(
          id,
          `${path}/release-notes.md`
        );
      });
      it("uses path.join to build package.json path", () => {
        expect(mockJoin).toHaveBeenNthCalledWith(id, path, "package.json");
      });
      it("reads package.json file", () => {
        const callNumber = id * 2 - 1;
        expect(mockReadFileSync).toHaveBeenNthCalledWith(
          callNumber,
          `${path}/package.json`,
          "utf8"
        );
      });
      it("reads release-note.md file", () => {
        const callNumber = id * 2;
        expect(mockReadFileSync).toHaveBeenNthCalledWith(
          callNumber,
          `${path}/release-notes.md`,
          "utf8"
        );
      });
      it("logs found package", () => {
        expect(mockLog).toHaveBeenNthCalledWith(
          id + 1,
          `found release notes for ${pkg.name}`
        );
      });
    });

    it("logs summary", () => {
      expect(mockYellow).toHaveBeenCalledTimes(1);
      expect(mockYellow).toHaveBeenCalledWith(mockFiles.length);

      expect(mockLog).toHaveBeenLastCalledWith(
        `yellow(${mockFiles.length}) release notes found`
      );
    });

    it("should return the collection of release-notes.md files present in the project", () => {
      const expected = {
        ...envWithConfig,
        releaseNotes: mockFiles.map((file) => ({
          package: file.pkg.name,
          releaseNote: {
            path: `${file.path}/release-notes.md`,
            content: file.releaseNoteMd,
          },
        })),
      };
      expect(result).toEqual(expected);
    });
  });
});
