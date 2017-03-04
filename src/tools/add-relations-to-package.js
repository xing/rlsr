module.exports = (nsp, pkgs) => pkg => {
  pkg[nsp].dependencies.forEach(dep => pkgs[dep][nsp].relations.push(pkg.name));
  return pkg;
};
