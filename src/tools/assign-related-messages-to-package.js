module.exports = (nsp, pkgs) => pkg => {
  const informRelated = (msg, relatedPackageName) => {
    pkgs[relatedPackageName][nsp].relatedMessages.push(msg);
    // no recursion - only direct relations are bumped
    // pkgs[relatedPackageName][nsp].relations.forEach(pkgName => informRelated(msg, pkgName));
  };

  pkg[nsp].relations.forEach(pkgName => pkg[nsp].messages.forEach(msg => informRelated(msg, pkgName)));
  return pkg;
};
