module.exports = nsp => pkg => Object.assign({}, pkg, {[nsp]: {
  file: pkg[nsp].file
}});
