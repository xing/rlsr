const path = require('path');
const R = require('ramda');
const exec = require('./exec');
const getPackages = require('../read/getPackages');

const command = R.curry((log, dbg, dir, cmd, description) => {
  log(`exec command: ${description}`);
  return exec(dbg, dir, cmd);
});

module.exports = (log, dbg) => {
  const runInDir = command(log, dbg);
  const run = runInDir(null);

  return {
    commitChanges: (env, packages, additionalPackages) => {
      return getPackages(
        path.join(env.appRoot, env.config.packagePath),
        env.consts.nsp
      ).then(allPackages => {
        const nameToDir = name => allPackages.find(p => p.name === name)[env.consts.nsp].dir;

        return R.flatten(
          packages
            .map(nameToDir)
            .map(dir => [
              path.join(dir, 'changelog.md'),
              path.join(dir, 'package.json')
            ])
            .concat(
              additionalPackages
                .map(nameToDir)
                .map(dir =>
                  path.join(dir, 'package.json')
                )
            )
            .concat([path.join(env.appRoot, 'changelog.json')])
        ).join(' ');
      }).then((files) => run(
        `git add ${files} && git commit -m "chore: release ${env.mainPackage.version}"`,
        `committing changelogs for version <${env.mainPackage.version}>`
      ));
    },
    tagPackage: (name, version) =>
      run(
        `git tag -a -m 'chore: tagged ${name}@${version}' ${name}@${version}`,
        `adding git tag for <${name}@${version}>`
      ),
    publishPackage: (name, version, dir, tag) =>
      runInDir(
        dir,
        `npm publish -ddd -tag ${tag}`,
        `publishing <${name}@${version}> with tag <${tag}>`
      ),
    commitMain: version =>
      run(
        `git add package.json && git commit -m "chore: update main package ${version}"`,
        `committing changes for <${version}>`
      ),
    tagMain: version =>
      run(
        `git tag -a -m 'chore: tagged main package @ ${version}' ${version}`,
        `adding general git tag <${version}>`
      ),
    push: (remote, branch) =>
      run(`git push ${remote} ${branch} --follow-tags`, 'pushing to remote')
  };
};
