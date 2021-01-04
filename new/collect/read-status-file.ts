import { Module, Status } from '../types';
import { join } from 'path';

/**
 * Reads the top level rlsr.json and adds the data to env
 */
export const readStatusFile: Module = async (env) => {
  let status: Status;
  try {
    status = require(join(env.appRoot, 'rlsr.json'));
    return { ...env, status, hasStatusFile: false };
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      // throws e.g. when the file is malformed
      throw e;
    } else {
      // when the file is not yet there
      return { ...env, hasStatusFile: false };
    }
  }
};
