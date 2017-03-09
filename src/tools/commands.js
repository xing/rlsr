const exec = require('./exec');
const R = require('ramda');

const command = R.curry((log, dbg, dir, cmd, description) => () => {
  log(`exec command: ${description}`);
  return exec(dbg, dir, cmd);
});

module.exports = (log, dbg) => {
  const runInDir = command(log, dbg);
  const run = runInDir(null);
  return {
    commitChanges: version => run(
      `git add . && git commit -m "chore: release ${version}"`,
      `committing changelogs for version <${version}>`
    ),
    tagPackage: (name, version) => run(
      `git tag -a -m 'chore: tagged ${name}@${version}' ${name}@${version}`,
      `adding git tag for <${name}@${version}>`
    ),
    publishPackage: (name, version, dir) => runInDir(
      dir,
      `npm publish -ddd`,
      `publishing <${name}@${version}>`
    ),
    commitMain: version => run(
      `git add . && git commit -m "chore: update main package ${version}"`,
      `committing changes for <${version}>`
    ),
    tagMain: version => run(
      `git tag -a -m 'chore: tagged main package @ ${version}' ${version}`,
      `adding general git tag <${version}>`
    ),
    push: () => run(
      `git push --follow-tags`,
      `pushing to remote`
    )
  };
};
