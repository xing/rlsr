const R = require('ramda');
const semver = require('semver');

const parseVersion = s => s.split('.').map(n => parseInt(n));

const parseComparator = comp => {
  switch (comp.operator) {
    case '>': return [comp.semver.major, comp.semver.minor, comp.semver.patch + 1];
    case '<':
      const res = [comp.semver.major, comp.semver.minor, comp.semver.patch - 1];
      if (res[2] < 0) {
        res[2] = null;
        res[1] = res[1] - 1;
        if (res[1] < 0) {
          res[1] = null;
          res[0] = res[0] - 1;
        }
      }
      return res;
    default: return [comp.semver.major, comp.semver.minor, comp.semver.patch];
  }
};

const getDependencyAst = module.exports.getDependencyAst = range => {
  const rawRange = new semver.Range(range).set[0];
  const parsedRange = rawRange.map(parseComparator);
  if (parsedRange.length === 1 && !rawRange[0].operator) {
    parsedRange[1] = R.clone(parsedRange[0]);
  }
  return {
    from: parsedRange[0],
    to: parsedRange[1]
  };
};

const satisfies = module.exports.satisfies = semver.satisfies;

const ast2string = ast => ast.from.filter(v => v !== null).join('.') + ' - ' + ast.to.filter(v => !!v).join('.');

module.exports.adjustRange = (version, oldDep) => {
  if (satisfies(version, oldDep)) {
    return oldDep;
  }
  const newMajor = parseVersion(version)[0];
  const ret = getDependencyAst(oldDep);
  ret.to = [newMajor, null, null];
  return ast2string(ret);
};

module.exports.bump = (oldVersion, bump) => {
  const parsed = parseVersion(oldVersion);

  switch (bump) {
    case 0:
      parsed[2]++;
      break;
    case 1:
      parsed[2] = 0;
      parsed[1]++;
      break;
    case 2:
      parsed[2] = 0;
      parsed[1] = 0;
      parsed[0]++;
  }

  return `${parsed[0]}.${parsed[1]}.${parsed[2]}`;
};
