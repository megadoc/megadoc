var t = require('babel-types');

function parseStatics(node) {
  var statics = [];

  var staticsNode = node.properties.filter(function(propNode) {
    return (
      t.isObjectProperty(propNode) &&
      t.isIdentifier(propNode.key) &&
      propNode.key.name === 'statics'
    );
  })[0];

  if (staticsNode) {
    if (t.isObjectExpression(staticsNode.value)) {
      staticsNode.value.properties.forEach(function(staticNode) {
        statics.push(staticNode.key.name);
      })
    }
  }

  return statics;
}

module.exports = parseStatics;