/* eslint-env node, jest */

const refineMessages = require('../src/tools/refine-messages');
const getEnv = require('./fixtures/env-small.fixture');

const getMessage = () => ({
  type: 'feat',
  scope: 'scope',
  subject: 'short desc',
  header: 'feat(scope): short desc',
  body: 'affects: a, b, c\n\nBody\nBody Line 2',
  footer: 'BREAKING CHANGE:\nDescription\n\nISSUES CLOSED: #45'
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
    const env = getEnv({}, [getPatchMessage()]);
    env.packageNames = ['a', 'b'];
    const exp = refineMessages(env);

    expect(exp.messages[0].level).toBe(0);
  });

  it('detects a minor message', () => {
    const env = getEnv({}, [getMinorMessage()]);
    env.packageNames = ['a', 'b', 'c'];
    const exp = refineMessages(env);

    expect(exp.messages[0].level).toBe(1);
  });

  it('detects a major message', () => {
    const env = getEnv({}, [getMajorMessage()]);
    env.packageNames = ['a', 'b', 'c'];
    const exp = refineMessages(env);

    expect(exp.messages[0].level).toBe(2);
  });

  it('can work with several messages', () => {
    const env = getEnv({}, [getMinorMessage(), getPatchMessage()]);
    env.packageNames = ['a', 'b', 'c'];
    const exp = refineMessages(env);

    expect(exp.messages).toHaveLength(2);
  });

  it('filters irrelevant messages', () => {
    const env = getEnv({}, [
      getMinorMessage(),
      getPatchMessage(),
      getIrrelevantMessage()
    ]);
    env.packageNames = ['a', 'b', 'c'];
    const exp = refineMessages(env);

    expect(exp.messages).toHaveLength(2);
  });

  it('parses affected packages', () => {
    const env = getEnv({}, [getMinorMessage()]);
    env.packageNames = ['a', 'b', 'c'];
    const exp = refineMessages(env);

    expect(exp.messages[0].affected).toEqual(['a', 'b', 'c']);
  });

  it('parses single affected packages', () => {
    const env = getEnv({}, [getMessageWithSinglePackage()]);
    env.packageNames = ['a', 'b', 'c'];
    const exp = refineMessages(env);

    expect(exp.messages[0].affected).toEqual(['a']);
  });
});
