/* eslint-env node, jest */

import type { Env } from "../../types";
import { envWithConfig } from "../../fixtures/env";

const mockRootDirectory = "path/to/root";
const mockCwd = jest.spyOn(process, "cwd");
mockCwd.mockImplementation(() => mockRootDirectory);

const mockPackagesPaths: string[] = [
  "path/to/first/package.json",
  "path/to/second/package.json",
];
const mockSync = jest.fn(() => mockPackagesPaths);
jest.mock("glob", () => ({ sync: mockSync }));

describe("addAllPackageJsons Module", () => {
  let result: Env;
  beforeAll(() => {
    const { addAllPackageJsons } = require("../add-all-package-jsons");
    result = addAllPackageJsons(envWithConfig);
  });

  it("uses the right golb pattern for package.json", () => {
    expect(mockCwd).toHaveBeenCalledTimes(1);

    expect(mockSync).toHaveBeenCalledTimes(1);
    expect(mockSync).toHaveBeenCalledWith(
      `${mockRootDirectory}/!(node_modules)/**/package.json`
    );
  });
  it("should return the collection of package.json files present in the project", () => {
    const expected = { ...envWithConfig, packageJsonPaths: mockPackagesPaths };
    expect(result).toEqual(expected);
  });
});
