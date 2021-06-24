import { spawn } from 'child_process';
import c from 'chalk';
import { Env, Module } from '../types';
import { logger } from './logger';

type Output = 'silent' | 'inf' | 'err';

type Command = (
  topic: string,
  /**
   * can be a string or an array of strings -
   * use an array if you have to deal with empty spaces -
   * like in a commit message
   * */
  cmd: (env: Env) => string | string[],
  stdout: Output,
  stderr: Output
) => Module;

export const command: Command = (topic, cmd, stdout, stderr) => (env) =>
  new Promise<Env>((resolve, reject) => {
    const { log, error } = logger(topic);
    const commandString = cmd(env);
    log(
      `running ${c.greenBright(
        typeof commandString === 'string'
          ? commandString
          : commandString.join(' ')
      )}`
    );
    const [main, ...other] =
      typeof commandString === 'string'
        ? commandString.split(' ')
        : commandString;
    const publisher = spawn(main, other);

    if (stdout !== 'silent') {
      const print = stdout === 'inf' ? log : error;
      publisher.stdout.on('data', (data) => {
        data
          .toString()
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean)
          .map((line: string) => print(`${c.dim('cmd>')} ${line}`));
      });
    }

    if (stderr !== 'silent') {
      const print = stderr === 'inf' ? log : error;
      publisher.stderr.on('data', (data) => {
        data
          .toString()
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean)
          .map((line: string) => print(`${c.dim('cmd>')} ${line}`));
      });
    }

    publisher.on('close', (code) => {
      if (code === 0) {
        resolve(env);
      } else {
        error(
          `command ${c.red(commandString)} stopped with error code ${c.red(
            code
          )}`
        );
        reject();
        process.exit(code || 1);
      }
    });
  });
