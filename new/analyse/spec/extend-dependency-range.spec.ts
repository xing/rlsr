/* eslint-env node, jest */
import type { Env, Module, Package } from '../../types';

import { envWithConfig } from '../../fixtures/env';
import { clone } from 'ramda';

// mock Packages
const buildPackage = (name: string): Package => ({
  currentVersion: '1.0.0',
  messages: [],
  relatedMessages: [],
  dependingOnThis: [],
  dependsOn: [],
  determinedIncrementLevel: -1,
  path: `path/to/${name}`,
  packageJson: [],
});

// mock Logger
const mockLog = jest.fn();
const mockLogger = jest.fn(() => ({ log: mockLog }));
jest.doMock('../../helpers/logger', () => ({ logger: mockLogger }));

describe('ExtendDependencyRange Module', () => {
  let extendDependencyRanges: Module;
  let result: Env;
  let expectedPackages: Env['packages'];

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    // mock Date
    jest.useFakeTimers('modern').setSystemTime(new Date(2020, 3, 1));

    const mockPackages = {
      'test-package-1': buildPackage('test-package-1'),
      'test-package-2': buildPackage('test-package-2'),
      'test-package-3': buildPackage('test-package-3'),
      'test-package-4': buildPackage('test-package-4'),
    };

    // package 1 depends on 2 (tilde)
    // package 1 depends on 3 (pinned)
    // package 2 devDepends on 3 (carret)
    // package 3 peerDepends on 4 (range)
    // package 4 depend on lodash (star)
    mockPackages['test-package-1'].dependsOn.push(
      {
        name: 'test-package-2',
        range: '~1.0.0',
        type: 'default',
      },
      {
        name: 'test-package-3',
        range: '1.0.0',
        type: 'default',
      }
    );
    mockPackages['test-package-2'].dependsOn.push({
      name: 'test-package-3',
      range: '^1',
      type: 'dev',
    });
    mockPackages['test-package-3'].dependsOn.push({
      name: 'test-package-4',
      range: '2.5.0 - 3',
      type: 'peer',
    });
    mockPackages['test-package-4'].dependsOn.push({
      name: 'lodash',
      range: '*',
      type: 'default',
    });

    const mockEnv: Env = { ...envWithConfig, packages: mockPackages };
    expectedPackages = clone(mockPackages);
    expectedPackages['test-package-1'].dependsOn[1].range = '~1.0.0';
    expectedPackages['test-package-1'].determinedIncrementLevel = 0;
    expectedPackages['test-package-1'].relatedMessages.push({
      date: new Date().toISOString(),
      text: `affected dependencies: test-package-3`,
      level: 'patch',
    });

    extendDependencyRanges =
      require('../extend-dependency-ranges').extendDependencyRanges;
    result = extendDependencyRanges(mockEnv) as Env;
  });

  it('returns an Env config object', () => {
    expect(result).toEqual({ ...envWithConfig, packages: expectedPackages });
  });

  /**
   * Individual assertions on extending scenarios below
   */
  it('extends pinned internal package versions ("1.0.0" -> "~1.0.0")', () => {
    expect(result.packages!['test-package-1'].dependsOn[1].range).toEqual(
      '~1.0.0'
    );
  });

  it('leaves range versions ("1 - 2") untouched', () => {
    expect(result.packages!['test-package-3'].dependsOn[0].range).toEqual(
      '2.5.0 - 3'
    );
  });

  it('leaves tilde versions (~1.0) untouched', () => {
    expect(result.packages!['test-package-1'].dependsOn[0].range).toEqual(
      '~1.0.0'
    );
  });

  it('leaves carret versions (^2.0) untouched', () => {
    expect(result.packages!['test-package-2'].dependsOn[0].range).toEqual('^1');
  });

  it('leaves external dependencies untouched', () => {
    expect(result.packages!['test-package-4'].dependsOn[0].range).toEqual('*');
  });

  it('flags increment level on affected packages', () => {
    expect(result.packages!['test-package-1'].determinedIncrementLevel).toEqual(
      0
    );
  });

  it('adds a patch message to each affected dependency', () => {
    expect(result.packages!['test-package-1'].relatedMessages).toEqual([
      {
        date: new Date().toISOString(),
        text: `affected dependencies: test-package-3`,
        level: 'patch',
      },
    ]);
  });
});
