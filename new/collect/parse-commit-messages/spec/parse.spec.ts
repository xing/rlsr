import type { MessageRaw, MessageConventionalCommit } from "../../../types";

// mock conventional-commits-parser
const mockType = "mockType";
const mockScope = "mockScope";
const mockSubject = "mockSubject";
const mockSync = jest.fn(() => ({
  type: mockType,
  scope: mockScope,
  subject: mockSubject,
}));
jest.mock("conventional-commits-parser", () => ({
  sync: mockSync,
}));

describe("parse commits", () => {
  let parse: (message: MessageRaw) => MessageConventionalCommit;
  let result: MessageConventionalCommit;
  const mockMessage = {
    hash: "d1eb6c0bde101c77205bdc42a1ea5513d61da0d9",
    date: "Sat Jun 5 13:33:23 2021 -0300",
    message: `mock commit message`,
    body: `mock commit body message`,
  };

  beforeAll(() => {
    parse = require("../parse").parse;
    result = parse(mockMessage);
  });

  it('adds "text", "type", "scope" and "subject" to message object', () => {
    expect(result).toEqual({
      ...mockMessage,
      text: mockMessage.message + "\n" + mockMessage.body,
      type: mockType,
      scope: mockScope,
      subject: mockSubject,
    });
  });
});
