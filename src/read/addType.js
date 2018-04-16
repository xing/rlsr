// adding type manually because commitizen cant handle '@' and '/'

module.exports = msg => {
  const headerRegex = /^(\w*)(?:\(([\w@/$.\-*]*)\))?: (.*)$/;
  const matches = msg.header.match(headerRegex);
  if (!matches) return msg;
  return Object.assign({}, msg, {
    type: matches[1],
    scope: matches[2],
    subject: matches[3]
  });
};
