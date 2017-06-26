const R = require('ramda');
const message = { type: 'fix', subject: 'foo', scope: 'one' };

module.exports = name => R.assoc('subject', name, message);
