import type { Env } from '../../types';

// "path" mocks
const mockJoin = jest.fn((...args) => args.join(''));
jest.mock('path', () => ({
  join: mockJoin,
}));

describe('read-status-file', () => {
  const mockEnv: Env = { stage: 'canary', force: false, appRoot: '/' };
  const mockStatus = { name: 'rlsr' };
  let result: Env;

  describe('on success', () => {
    beforeAll(async () => {
      jest.mock(`${mockEnv.appRoot}rlsr.json`, () => mockStatus, {
        virtual: true,
      });
      const readStatusFile = require('../read-status-file').readStatusFile;
      result = await readStatusFile(mockEnv);
    });
    afterAll(() => {
      jest.unmock(`${mockEnv.appRoot}rlsr.json`);
    });

    test('joins paths', () => {
      expect(mockJoin).toHaveBeenCalledTimes(1);
      expect(mockJoin).toHaveBeenCalledWith(mockEnv.appRoot, 'rlsr.json');
    });

    test('returns an Env object with status', () => {
      expect(result).toEqual({
        ...mockEnv,
        hasStatusFile: true,
        status: mockStatus,
      });
    });
  });

  describe('on missing file', () => {
    beforeAll(async () => {
      const readStatusFile = require('../read-status-file').readStatusFile;
      result = await readStatusFile(mockEnv);
    });
    test('returns an Env object, with "hasStatusFile" set to false', () => {
      expect(result).toEqual({ ...mockEnv, hasStatusFile: false });
    });
  });

  describe('on malformed file', () => {
    beforeAll(async () => {
      jest.mock(`${mockEnv.appRoot}rlsr.json`, () => 'malformed Status file', {
        virtual: true,
      });
    });
    afterAll(() => {
      jest.unmock(`${mockEnv.appRoot}rlsr.json`);
    });

    // @TODO: Figure this one out
    test.todo('throws an error');
    // test('throws an error', () => {
    //   expect(async () => {
    //     const readStatusFile = require("../read-status-file").readStatusFile;
    //     await readStatusFile(mockEnv);
    //   }).toThrow("MODULE_NOT_FOUND");
    // });
  });
});
