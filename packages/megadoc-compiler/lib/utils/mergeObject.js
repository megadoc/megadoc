module.exports = function mergeObject(object, nextAttributes) {
  return Object.assign({}, object, nextAttributes);
};
