/* eslint-env node, jest */

const polishPackages = require('../src/tools/polish-package');

describe('polish-package', () => {
  it('decorates a package with meta data', () => {
    const nsp = 'foolsr';
    const packages = ['foo', 'bar', 'baz'];
    const pkg = {
      dependencies: {
        foo: '0.0.0',
        baz: '9999.0.1'
      }
    };

    expect(polishPackages(nsp, packages)(pkg)).toEqual({
      dependencies: {
        baz: "9999.0.1",
        foo: "0.0.0",
      },
      [nsp]: {
        dependencies: [
          'foo',
          'baz',
        ],
        determinedIncrementLevel: -1,
        messages: [],
        relatedMessages: [],
        relations: [],
      },
    });
  });

  it('does not add unknown dependencies', () => {
    const nsp = 'drrrt';
    const packages = ['foo', 'bar', 'baz'];
    const pkg = {
      dependencies: {
        drrt: '0.666.0'
      }
    };

    expect(polishPackages(nsp, packages)(pkg)[nsp].dependencies).toEqual([]);
  });
});