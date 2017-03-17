/* eslint-env node, jest */

const semver = require('../src/tools/semver');
const TYPES = ['patch', 'minor', 'major'];

describe('bump()', () => {
  [[-1, '1.2.3'], [0, '1.2.4'], [1, '1.3.0'], [2, '2.0.0']].forEach(data => it(`bumps ${TYPES[data[0]] || 'illegal'} versions (1.2.3 => ${data[1]})`, () => {
    expect(semver.bump('1.2.3', data[0])).toEqual(data[1]);
  }));
});

describe('getDependencyAst()', () => {
  const compare = (input, expected) => expect(semver.getDependencyAst(input)).toEqual(expected);

  it('recognizes a fixed dependency', () => compare(
    '1.2.3',
    {from: [1, 2, 3], to: [1, 2, 3]}
  ));

  it('recognizes a caret range dependency', () => compare(
    '^1.2.3',
    {from: [1, 2, 3], to: [1, null, null]}
  ));

  it('recognizes a hyphen range dependency', () => compare(
    '1.2.3 - 2',
    {from: [1, 2, 3], to: [2, null, null]}
  ));
});

describe('adjustRange()', () => {
  const compare = (version, oldDep, newDep) => expect(semver.adjustRange(version, oldDep)).toEqual(newDep);

  it('updates a fixed dependency with minor / patch versions', () => compare('1.1.0', '1.0.0', '1.0.0 - 1'));
  it('updates a fixed dependency', () => compare('2.0.0', '1.0.0', '1.0.0 - 2'));
  it('updates a fixed dependency with minor / patch versions', () => compare('2.1.0', '1.0.0', '1.0.0 - 2'));
  it('updates a caret range dependency', () => compare('2.0.0', '^1.0.0', '1.0.0 - 2'));
  it('updates a caret range dependency with more than one version', () => compare('3.0.0', '^1.0.0', '1.0.0 - 3'));
  it('keeps a caret range dependency if it is sufficient', () => compare('1.1.0', '^1.0.0', '^1.0.0'));
  it('updates a hyphen range dependency', () => compare('3.0.0', '1.0.0 - 2', '1.0.0 - 3'));
  it('updates a hyphen range dependency with minor / patch versions', () => compare('3.1.0', '1.0.0 - 2', '1.0.0 - 3'));
  it('keeps a hyphen range dependency if it is sufficient (minor)', () => compare('1.1.0', '1.0.0 - 2', '1.0.0 - 2'));
  it('keeps a hyphen range dependency if it is sufficient (next major)', () => compare('2.0.0', '1.0.0 - 2', '1.0.0 - 2'));
  it('keeps a hyphen range dependency if it is sufficient, (minor after next major)', () => compare('2.1.0', '1.0.0 - 2', '1.0.0 - 2'));
});
