import { envWithConfig } from '../../fixtures/env';
import { Env } from '../../types';
import { addLastReleaseHash } from '../add-last-release-hash';

/* eslint-env node, jest */
describe('addLastReleaseHash Module', () => {
  beforeEach(() => {
    //removing log output for sanity reasons
    jest.spyOn(console, 'log').mockImplementation();
  });

  it('uses the hash from the rlsr.json when it is there', async (done) => {
    const env: Env = {
      ...envWithConfig,
      status: { versions: {}, lastReleaseHash: 'foo' },
    };
    expect((await addLastReleaseHash(env)).lastReleaseHash).toBe('foo');
    done();
  });

  type TestData = [string, string[], string, string];
  [
    [
      'release tag on master',
      ['release@3.0', '2.0.0', '1.0.0'],
      'master',
      'release@3.0',
    ] as TestData,
    [
      'release tag on master, not latest',
      ['2.0.0', 'release@3.0', '1.0.0'],
      'master',
      'release@3.0',
    ] as TestData,
    [
      'release tag not on master',
      ['2.0.0', 'release@3.0', '1.0.0'],
      'production',
      '2.0.0',
    ] as TestData,
    [
      'skipping release tags',
      ['3.0.0-rc.1', '2.0.0', 'release@3.0'],
      'production',
      '2.0.0',
    ] as TestData,
  ].forEach(([text, allTags, currentBranch, expectation]: TestData) => {
    it(`uses the correct tag for case <${text}>`, async (done) => {
      const env: Env = {
        ...envWithConfig,
        currentBranch,
        allTags,
      };
      expect((await addLastReleaseHash(env)).lastReleaseHash).toBe(expectation);
      done();
    });
  });
});
