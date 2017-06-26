/* eslint-env node, jest */

const modifyPackages = require('../src/tools/modify-packages');

describe('modifyPackages()', () => {
  it('replaces the packages in env with a new version', () => {
    const fixture = { a: 1, b: 2 };
    const res = modifyPackages(fixture, {
      foo: 'bar',
      packages: [{ name: 'a' }, { name: 'b' }]
    });
    expect(res.foo).toEqual('bar');
    expect(res.packages).toEqual(fixture);
  });

  it('can be curried', () => {
    const fixture = { a: 1, b: 2 };
    const res = modifyPackages(fixture)({
      foo: 'bar',
      packages: [{ name: 'a' }, { name: 'b' }]
    });
    const res2 = modifyPackages(fixture, {
      foo: 'bar',
      packages: [{ name: 'a' }, { name: 'b' }]
    });
    expect(res).toEqual(res2);
  });
});
