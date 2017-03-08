const R = require('ramda');
const cp = require('child_process');

module.exports = R.curry((log = console.log, dbg = console.log, line) => new Promise(
  (resolve, reject) => {
    const t = Date.now();
    log(`executing <${line}>`);
    cp.exec(line, (error, stdout, stderr) => {
      log(`<${line}> done in ${Date.now() - t}ms`);
      dbg(stdout);
      dbg(stderr);
      if (error) {
        reject(error);
        return;
      }
    });
  }
));
