import { red, yellow, dim, green } from 'chalk';

const levels = {
  debug: dim('dbg'),
  log: green('log'),
  warn: yellow('wrn'),
  error: red('ERR'),
};

const log = (level: 'debug' | 'log' | 'warn' | 'error', section: string) => (
  ...rest: any[]
) => {
  console.log(`${levels[level]} ${dim('[' + section + ']')}`, ...rest);
};

export const logger = (section: string) => ({
  debug: log('debug', section),
  log: log('log', section),
  warn: log('warn', section),
  error: log('error', section),
});
