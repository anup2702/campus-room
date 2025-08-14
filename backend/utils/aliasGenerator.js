function generateAlias() {
  return `Anon${Math.floor(100 + Math.random() * 900)}`;
}

module.exports = generateAlias;
