const cp = require('child_process');

module.exports = (line, logger = console.log) => new Promise((resolve, reject) => cp.exec(line, (error, stdout, stderr) => {
  if (error) {
    reject(error);
    return;
  }

  logger(stdout);
}));
