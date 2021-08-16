import { clone } from 'ramda';

import type { Env, Module, Phase } from '../../types';

import { composeAsync } from '../compose-async';

// mock logger
const mockLog = jest.fn();
const mockError = jest.fn();
const mockLogger = jest.fn(() => ({ error: mockError, log: mockLog }));
jest.mock('../logger', () => ({ logger: mockLogger }));

// mock Plugins
const mockPluginModule1: Module = jest.fn(
  (env) => env
) as jest.MockedFunction<Module>;
const mockPluginModule2: Module = jest.fn(
  (env) => env
) as jest.MockedFunction<Module>;
const mockPluginModule3: Module = jest.fn(
  (env) => env
) as jest.MockedFunction<Module>;
const mockPluginPackage1 = {
  collect: mockPluginModule1,
  analyse: mockPluginModule2,
};
jest.doMock('test-plugin-package-1', () => mockPluginPackage1, {
  virtual: true,
});
const mockPluginPackage2 = { collect: mockPluginModule3 };
jest.doMock('test-plugin-package-2', () => mockPluginPackage2, {
  virtual: true,
});

// mock Env
import { envWithConfig } from '../../fixtures/env';
const mockEnv = { ...envWithConfig };

const mockEnvWithPlugins = clone(mockEnv);
mockEnvWithPlugins.config!.plugins = [
  'test-plugin-package-1',
  'test-plugin-package-2',
];

// mock compose-async
jest.mock('../compose-async');
const mockComposeAsync = composeAsync as jest.MockedFunction<
  typeof composeAsync
>;
const mockComposedModule = jest.fn(() => mockEnv);
mockComposeAsync.mockImplementation(() => mockComposedModule);

describe('plugin helper module', () => {
  let plugins: (phase: Phase) => Module;
  let result: Env;

  describe.each`
    phase        | expectedPlugins
    ${'collect'} | ${[mockPluginModule1, mockPluginModule3]}
    ${'analyse'} | ${[mockPluginModule2]}
    ${'change'}  | ${[]}
    ${'persist'} | ${[]}
  `('when phase is $phase', ({ phase, expectedPlugins }) => {
    describe('with registered Plugins', () => {
      beforeAll(() => {
        jest.clearAllMocks();

        plugins = require('../plugins').plugins;

        result = plugins(phase)(mockEnvWithPlugins) as Env;
      });

      it('requires plugins', () => {
        expect(mockComposeAsync).toHaveBeenCalledTimes(1);
        expect(mockComposeAsync).toHaveBeenCalledWith(...expectedPlugins);
      });

      it('composes plugins', () => {
        expect(mockComposedModule).toHaveBeenCalledTimes(1);
        expect(mockComposedModule).toHaveBeenCalledWith(mockEnvWithPlugins);
      });

      it("returns composition's execution", () => {
        expect(result).toBe(mockEnv);
      });

      it('throws no error', () => {
        expect(mockError).not.toHaveBeenCalled();
      });
    });

    describe('with no Plugins', () => {
      beforeAll(() => {
        plugins = require('../plugins').plugins;

        result = plugins(phase)(mockEnv) as Env;
      });

      it('Plugin module returns env object untouched', () => {
        expect(result).toEqual(mockEnv);
      });
    });
  });
});
