const R = require('ramda');
const polishPackages = require('./polish-packages');
const refineMessages = require('./refine-messages');
const addRelationsToPackages = require('./add-relations-to-packages');
const addMessagesToPackages = require('./add-messages-to-packages');
const calculateOverallIncrement = require('./calculate-overall-increment');
const synchronizedUpdateAllVersions = require('./synchronized-update-all-versions');
const synchronizedAddRelatedMessages = require('./synchronized-add-related-messages');
const unsynchronizedCalculateNewVersion = require('./unsynchronized-calculate-new-version');
const unsynchronizedUpdateRelations = require('./unsynchronized-update-relations');
const calculateMainChangelogEntries = require('./calculate-main-changelog-entries');
const resolveRlsrLatest = require('./resolve-rlsr-latest');
const addPreviouslyUnreleased = require('./addPreviouslyUnreleased');
const cleanUp = require('./clean-up');

const isRangeMode = env =>
  env.config.mode === 'range' ||
  (env.config.mode === 'synchronizedMain' &&
    R.path(['mainPackage', env.consts.nsp, 'determinedIncrementLevel'], env) <
      2);
const isExactMode = env => env.config.mode === 'exact';
const isSynchronizedMode = env =>
  env.config.mode === 'synchronized' ||
  (env.config.mode === 'synchronizedMain' &&
    R.path(['mainPackage', env.consts.nsp, 'determinedIncrementLevel'], env) ===
      2);

const isUnsynchronizedMode = R.anyPass([isRangeMode, isExactMode]);

module.exports = R.pipe(
  polishPackages,
  refineMessages,
  addRelationsToPackages,
  addMessagesToPackages,
  calculateOverallIncrement,
  R.when(
    isSynchronizedMode,
    R.pipe(synchronizedUpdateAllVersions, synchronizedAddRelatedMessages)
  ),
  R.when(
    isUnsynchronizedMode,
    R.pipe(unsynchronizedCalculateNewVersion, unsynchronizedUpdateRelations)
  ),
  resolveRlsrLatest,
  calculateMainChangelogEntries,
  addPreviouslyUnreleased,
  cleanUp
);
