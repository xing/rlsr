const read = require('../read');
const transform = require('../transform');
const write = require('../write');

module.exports = env => read(env).then(transform).then(write).catch(env.err);
