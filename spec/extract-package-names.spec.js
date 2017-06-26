/* eslint-env node, jest */

const extractPackageNames = require('../src/tools/extract-package-names');

describe('extractPackageNames()', () => {
  it('writes package names into an array', () => {
    expect(
      extractPackageNames({
        packages: [{ name: 'a' }, { name: 'b' }]
      }).packageNames
    ).toEqual(['a', 'b']);
  });
});
