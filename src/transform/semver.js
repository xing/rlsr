const semver = require('semver');

const parseVersion = s => s.split('.').map(n => parseInt(n));

const satisfies = (module.exports.satisfies = semver.satisfies);

module.exports.adjustRange = (version, oldDep) => {
  if (satisfies(version, oldDep)) {
    return oldDep;
  }
  const newMajor = parseVersion(version)[0];

  return `^${newMajor}`;
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
