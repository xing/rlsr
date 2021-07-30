import { sortSemver } from '../sort-semver';

describe('sortSemver()', () => {
  type TestCase = [string, string[], string[]];
  const testCases: TestCase[] = [
    [
      'sorts semver tags',
      ['v1.0.0', 'v1.1.1', 'v0.3.0'],
      ['v1.1.1', 'v1.0.0', 'v0.3.0'],
    ],
    [
      'sorts semver tags and rc tags',
      ['v1.0.0', 'v1.0.0-rc.1', 'v1.0.0-rc.2', 'v1.1.0'],
      ['v1.1.0', 'v1.0.0', 'v1.0.0-rc.2', 'v1.0.0-rc.1'],
    ],
    [
      'sorts semver tags and release tags',
      ['release@v1.0', 'v1.0.0', 'v1.1.0', 'release@v1.1'],
      ['v1.1.0', 'release@v1.1', 'v1.0.0', 'release@v1.0'],
    ],
    [
      'sorts semver, rc and release tags',
      ['release@v1.0', 'v1.0.0', 'v1.0.0-rc.1'],
      ['v1.0.0', 'v1.0.0-rc.1', 'release@v1.0'],
    ],
    [
      'sorts patch levels',
      ['v1.0.0', 'v1.0.1', 'v1.0.0-rc.1', 'v1.1.0'],
      ['v1.1.0', 'v1.0.1', 'v1.0.0', 'v1.0.0-rc.1'],
    ],
  ];
  testCases.forEach(([description, given, expected]: TestCase) =>
    it(description, () => {
      expect(given.sort(sortSemver)).toEqual(expected);
    })
  );
});
