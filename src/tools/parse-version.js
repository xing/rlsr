module.exports = s => {
  const [major, minor, patch] = s.split('.');
  return {major, minor, patch};
};
