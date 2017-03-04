const parseVersion = s => {
  const [major, minor, patch] = s.split('.');
  return {major, minor, patch};
};

module.exports = (oldVersion, bump) => {
  const parsed = parseVersion(oldVersion);

  switch (bump) {
    case 0:
      parsed.patch++;
      break;
    case 1:
      parsed.patch = 0;
      parsed.minor++;
      break;
    case 2:
      parsed.patch = 0;
      parsed.minor = 0;
      parsed.major++;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
};

