/* eslint-env node, jest */

const refineMessages = require('../src/transform/refine-messages');

const getEnv = require('./fixtures/env-small.fixture');

const getMessage = () => ({
  type: 'feat',
  scope: 'scope',
  subject: 'short desc',
  header: 'feat(scope): short desc',
  body: 'affects: a, b, c\n\nBody\nBody Line 2',
  footer: 'BREAKING CHANGE:\nDescription\n\nISSUES CLOSED: #45',
});

const getMajorMessage = getMessage;
const getMinorMessage = () => Object.assign(getMessage(), { footer: 'Footer' });
const getPatchMessage = () =>
  Object.assign(getMessage(), { type: 'fix', footer: 'Footer' });
const getMessageWithSinglePackage = () =>
  Object.assign(getMessage(), { scope: 'a', body: 'Body' });
const getIrrelevantMessage = () =>
  Object.assign(getMessage(), { type: 'chore' });

describe('refineMessages()', () => {
  it('detects a patch message', () => {
    const env = getEnv({ a: {}, b: {} }, [getPatchMessage()]);
    const exp = refineMessages(env);

    expect(exp.messages[0].level).toBe(0);
  });

  it('detects a minor message', () => {
    const env = getEnv({ a: {}, b: {}, c: {} }, [getMinorMessage()]);
    const exp = refineMessages(env);

    expect(exp.messages[0].level).toBe(1);
  });

  it('detects a major message', () => {
    const env = getEnv({ a: {}, b: {}, c: {} }, [getMajorMessage()]);
    const exp = refineMessages(env);

    expect(exp.messages[0].level).toBe(2);
  });

  it('can work with several messages', () => {
    const env = getEnv({ a: {}, b: {}, c: {} }, [
      getMinorMessage(),
      getPatchMessage(),
    ]);
    const exp = refineMessages(env);

    expect(exp.messages).toHaveLength(2);
  });

  it('filters irrelevant messages', () => {
    const env = getEnv({ a: {}, b: {}, c: {} }, [
      getMinorMessage(),
      getPatchMessage(),
      getIrrelevantMessage(),
    ]);
    const exp = refineMessages(env);

    expect(exp.messages).toHaveLength(2);
  });

  it('parses affected packages', () => {
    const env = getEnv({ a: {}, b: {}, c: {} }, [getMinorMessage()]);
    const exp = refineMessages(env);

    expect(exp.messages[0].affected).toEqual(['a', 'b', 'c']);
  });

  it('parses single affected packages', () => {
    const env = getEnv({ a: {}, b: {}, c: {} }, [
      getMessageWithSinglePackage(),
    ]);
    const exp = refineMessages(env);

    expect(exp.messages[0].affected).toEqual(['a']);
  });
});
