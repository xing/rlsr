const path = require('path');
const R = require('ramda');
const exec = require('./exec');

const command = R.curry((log, dbg, dir, cmd, description) => {
  log(`exec command: ${description}`);
  return exec(dbg, dir, cmd);
});

module.exports = (log, dbg) => {
  const runInDir = command(log, dbg);
  const run = runInDir(null);

  return {
    commitChanges: (version, packageAbsPath, packages) => {
      const files = R.flatten(packages.map(p => [
        path.join(packageAbsPath, p, 'changelog.md'),
        packages.map(p => [path.join(packageAbsPath, p, 'package.json')])
      ])).join(' ');
      return run(
        `git add ${files} && git commit -m "chore: release ${version}"`,
        `committing changelogs for version <${version}>`
      );
    },
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
      `git add package.json && git commit -m "chore: update main package ${version}"`,
      `committing changes for <${version}>`
    ),
    tagMain: version => run(
      `git tag -a -m 'chore: tagged main package @ ${version}' ${version}`,
      `adding general git tag <${version}>`
    ),
    push: (remote, branch) => run(
      `git push ${remote} ${branch} --follow-tags`,
      `pushing to remote`
    )
  };
};
