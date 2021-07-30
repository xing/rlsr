export const sortSemver = (a: string, b: string) => {
  const [aMaj, aMin, aPatch = -1, aRC = 99] = getVersionSplit(a);
  const aComp =
    +aMaj * 100 * 100 * 100 + +aMin * 100 * 100 + +aPatch * 100 + +aRC;
  const [bMaj, bMin, bPatch = -1, bRC = 99] = getVersionSplit(b);
  const bComp =
    +bMaj * 100 * 100 * 100 + +bMin * 100 * 100 + +bPatch * 100 + +bRC;
  return bComp - aComp;
};

const getVersionSplit = (version: string) =>
  version
    .replace('release@', '')
    .replace('v', '')
    .replace('-rc', '')
    .split('.');
