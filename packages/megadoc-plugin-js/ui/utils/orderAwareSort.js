const { sortBy } = require('lodash');

module.exports = function(doc, array, key) {
  var preserveOrder = doc.tags.some(function(tag) {
    return tag.type === 'preserveOrder';
  });

  if (preserveOrder) {
    return sortBy(array, 'line');
  }
  else {
    return sortBy(array, key);
  }
};

module.exports.asNodes = function(documentNode, array, key) {
  var preserveOrder = documentNode.properties.tags.some(function(tag) {
    return tag.type === 'preserveOrder';
  });

  if (preserveOrder) {
    return sortBy(array, 'properties.line');
  }
  else {
    return sortBy(array, key);
  }
};