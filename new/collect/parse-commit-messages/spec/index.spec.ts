import { Env, Message, Module } from "../../../types";

// Helper
const buildMessageMock = (
  quantity: number,
  level: Message["level"]
): Message[] =>
  new Array(quantity).fill({
    level,
    hash: "hash",
    date: "date",
    message: "message",
    body: "body",
  });

// mock chalk
const mockYellow = jest.fn((text) => `yellow(${text})`);
jest.mock("chalk", () => ({ yellow: mockYellow }));

// mock lodash/fp
const mockMessageTransform = jest.fn((element) => element);
const mockPipe = jest.fn(() => mockMessageTransform);
jest.mock("lodash/fp", () => ({ pipe: mockPipe }));

// mock logger
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog }));
jest.mock("../../../helpers/logger", () => ({ logger: mockLogger }));

// mock parse helpers
const mockParse = jest.fn();
const mockRefineType = jest.fn();
const mockAddLevel = jest.fn();

jest.mock("../parse", () => ({ parse: mockParse }));
jest.mock("../refine-type", () => ({ refineType: mockRefineType }));
jest.mock("../add-level", () => ({ addLevel: mockAddLevel }));

describe("parse-commit-messages", () => {
  let parseCommitMessages: Module;

  beforeAll(() => {
    parseCommitMessages = require("../index").parseCommitMessages;
  });
  test('creates "git messages" logger', () => {
    expect(mockLogger).toHaveBeenCalledTimes(1);
    expect(mockLogger).toHaveBeenCalledWith("git messages");
  });
  test("chain parsers (parse, refineType and addLevel) to parse messages", () => {
    expect(mockPipe).toHaveBeenCalledTimes(1);
    expect(mockPipe).toHaveBeenCalledWith(
      mockParse,
      mockRefineType,
      mockAddLevel
    );
  });

  describe.each`
    major | minor | patch | misc
    ${0}  | ${0}  | ${0}  | ${1}
    ${1}  | ${0}  | ${0}  | ${1}
    ${0}  | ${2}  | ${0}  | ${2}
    ${0}  | ${0}  | ${3}  | ${3}
    ${1}  | ${2}  | ${3}  | ${4}
  `(
    "on $major major, $minor minor, $patch patch, $misc misc",
    ({ major, minor, patch, misc }) => {
      const mockEnv: Env = {
        stage: "canary",
        force: false,
        appRoot: "/",
        rawCommitMessages: [
          ...buildMessageMock(major, "major"),
          ...buildMessageMock(minor, "minor"),
          ...buildMessageMock(patch, "patch"),
          ...buildMessageMock(misc, "misc"),
        ],
      };
      let result: Env;
      beforeAll(() => {
        result = parseCommitMessages(mockEnv) as Env;
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      test(`logs ${major} major, ${minor} minor and ${patch} patch commits`, () => {
        expect(mockYellow).toHaveBeenCalledTimes(1);
        expect(mockYellow).toHaveBeenCalledWith(major + minor + patch);
        expect(mockLog).toHaveBeenCalledTimes(1);
        expect(mockLog).toHaveBeenCalledWith(
          `yellow(${
            major + minor + patch
          }) relevant commits: ${major} major / ${minor} minor / ${patch} patch`
        );
      });

      test(`returns an Env config object with ${
        major + minor + patch
      } parsed messages in "commitMessages" attribute`, () => {
        expect(result).toEqual({
          ...mockEnv,
          commitMessages: [
            ...buildMessageMock(major, "major"),
            ...buildMessageMock(minor, "minor"),
            ...buildMessageMock(patch, "patch"),
          ],
        });
      });
    }
  );
});
