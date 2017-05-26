const { curry } = require('ramda');

module.exports = curry(function relativize(assetRoot, x) {
  const pattern = `${assetRoot || ''}/`;
  const sz = pattern.length;

  return x.indexOf(pattern) === 0 ? x.slice(sz) : x;
})
