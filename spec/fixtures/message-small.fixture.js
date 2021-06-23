const R = require('ramda');
const message = { type: 'fix', subject: 'foo', level: 2, affected: ['one'] };

module.exports = (name) => R.assoc('subject', name, message);
