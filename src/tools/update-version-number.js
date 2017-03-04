const R = require('ramda');
const bump = require('./bump');

module.exports = nsp => pkg => {
  const incrementLevelThroughRelation = pkg[nsp].relatedMessages.length > -1 ? 0 : -1;
  const incrementLevelsThroughMessages = pkg[nsp].messages.map(msg => msg.level);

  pkg[nsp].determinedIncrementLevel = R.last([incrementLevelThroughRelation, ...incrementLevelsThroughMessages].sort());

  pkg.version = bump(pkg.version, pkg[nsp].determinedIncrementLevel);
};
