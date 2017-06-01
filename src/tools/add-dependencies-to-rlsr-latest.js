module.exports = (env, packages) => p => {
  const RLSR_LATEST_DECLARATION = env.rlsrLatest;
  const exactRelations = env.exactRelations;

  p.dependencies &&
    Object.keys(p.dependencies).forEach(dep => {
      if (p.dependencies[dep] === RLSR_LATEST_DECLARATION) {
        const relatedVersion = packages[dep].version;
        p.dependencies[dep] = exactRelations
          ? relatedVersion
          : `^${relatedVersion}`;
      }
    });
};
