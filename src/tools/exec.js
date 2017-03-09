const R = require('ramda');
const cp = require('child_process');

module.exports = R.curry((log, dbg, cwd, line) => new Promise(
  (resolve, reject) => {
    console.log(line, cwd);
    const t = Date.now();
    setTimeout(() => {
      log(`executing <${line}>`);
      const opts = cwd ? {cwd} : null;
      try {
        cp.exec(line, opts, (error, stdout, stderr) => {
          log(`<${line}> done in ${Date.now() - t}ms`);
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
