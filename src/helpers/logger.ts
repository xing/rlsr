import { red, yellow, dim, green } from 'chalk';

let debug = false;

export const setDebug = (isDebug: boolean) => {
  debug = isDebug;
};

const levels = {
  debug: dim('dbg'),
  log: green('log'),
  warn: yellow('wrn'),
  error: red('ERR'),
};

const log =
  (level: 'debug' | 'log' | 'warn' | 'error', section: string) =>
  (...rest: any[]) => {
    // eslint-disable-next-line no-console
    console.log(`${levels[level]} ${dim('[' + section + ']')}`, ...rest);
  };

const setCurrentTopic = (topic: string) => {
  topic = topic;
};

export const logger = (section: string) => {
  setCurrentTopic(section);
  return {
    debug: debug ? log('debug', section) : () => undefined,
    log: log('log', section),
    warn: log('warn', section),
    error: log('error', section),
    throwMissingAttrError: (attr: string) => {
      const errorMessage = `missing "${attr}" on env object.`;
      log('error', section);
      throw new Error(errorMessage);
    },
  };
};
