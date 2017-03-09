const R = require('ramda');
const cp = require('child_process');

module.exports = R.curry((log, dbg, cwd, line) => new Promise(
  (resolve, reject) => {
    const t = Date.now();
    setTimeout(() => {
      const dir = cwd && 'current dir';
      log(`executing <${line}> in <${dir}`);
      const opts = cwd ? {cwd} : null;
      try {
        cp.exec(line, opts, (error, stdout, stderr) => {
          log(`<${line}> in <${dir} done in ${Date.now() - t}ms`);
          dbg(stdout);
          dbg(stderr);
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } catch (e) {
        reject(e);
      }
    }, 50);
  }
));
