var t = require('babel-types');

module.exports = function(node) {
  var displayNameNode = node.properties.filter(function(p) {
    return t.isIdentifier(p.key) && p.key.name === 'displayName';
  })[0];


  if (displayNameNode && t.isLiteral(displayNameNode.value)) {
    return displayNameNode.value.value;
  }
}