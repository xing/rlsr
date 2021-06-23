/* eslint-env node, jest */
const addType = require('../src/read/addType');

describe('<read> addType()', () => {
  [
    ['foo bar', undefined, undefined, undefined],
    ['feat: bar', 'feat', undefined, 'bar'],
    ['feat(foo): bar', 'feat', 'foo', 'bar'],
    ['feat(@scope/foo): bar', 'feat', '@scope/foo', 'bar'],
  ].forEach(([header, type, scope, subject]) =>
    it(`can handle '${header}'`, () => {
      const parsed = addType({ header });

      expect(parsed.header).toBe(header);
      expect(parsed.type).toBe(type);
      expect(parsed.scope).toBe(scope);
      expect(parsed.subject).toBe(subject);
    })
  );
  it('overrides existing type', () => {
    const parsed = addType({ header: 'foo: bar', type: 'baz' });

    expect(parsed.type).toBe('foo');
  });
});
