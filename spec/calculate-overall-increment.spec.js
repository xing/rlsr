/* eslint-env node, jest */
const calculateOverallIncrement = require('../src/transform/calculate-overall-increment');

const getEnv = require('./fixtures/env-small.fixture')({});

const messageL = { subject: 'l', level: 2, affected: ['a'] };
const messageM = { subject: 'm', level: 1, affected: ['a'] };
const messageS = { subject: 's', level: 0, affected: ['a'] };

describe('calculateOverallIncrement()', () => {
  it('increments at patch level', () => {
    const env = getEnv([messageS]);
    const exp = calculateOverallIncrement(env);

    expect(exp.mainPackage.rlsr.determinedIncrementLevel).toBe(0);
    expect(exp.mainPackage.version).toBe('1.2.4');
  });

  it('increments at minor level', () => {
    const env = getEnv([messageM]);
    const exp = calculateOverallIncrement(env);

    expect(exp.mainPackage.rlsr.determinedIncrementLevel).toBe(1);
    expect(exp.mainPackage.version).toBe('1.3.0');
  });

  it('increments at major level', () => {
    const env = getEnv([messageL]);
    const exp = calculateOverallIncrement(env);

    expect(exp.mainPackage.rlsr.determinedIncrementLevel).toBe(2);
    expect(exp.mainPackage.version).toBe('2.0.0');
  });

  it('increments even if several messages are available', () => {
    const env = getEnv([messageS, messageM, messageM]);
    const exp = calculateOverallIncrement(env);

    expect(exp.mainPackage.rlsr.determinedIncrementLevel).toBe(1);
    expect(exp.mainPackage.version).toBe('1.3.0');
  });

  it('increments nothing if no relevant message is provided', () => {
    const env = getEnv([]);
    const exp = calculateOverallIncrement(env);

    expect(exp.mainPackage.rlsr.determinedIncrementLevel).toBe(-1);
    expect(exp.mainPackage.version).toBe('1.2.3');
  });
});
