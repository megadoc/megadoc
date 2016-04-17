var K = require('../constants');
var t = require('babel-types');

module.exports = function generateContext(contextNode) {
  var ctx;

  if (
    t.isFunctionExpression(contextNode) ||
    t.isFunctionDeclaration(contextNode) ||
    t.isObjectMethod(contextNode)
  ) {
    ctx = parseFunctionExpression(contextNode);
  }
  else if (t.isVariableDeclarator(contextNode)) {
    return generateContext(contextNode.init);
  }
  else if (t.isVariableDeclaration(contextNode)) {
    return generateContext(contextNode.declarations[0]);
  }
  else if (t.isLiteral(contextNode)) {
    ctx = parseLiteral(contextNode);
  }
  else if (t.isObjectExpression(contextNode)) {
    ctx = parseObjectExpression(contextNode);
  }
  else if (t.isArrayExpression(contextNode)) {
    ctx = parseArrayExpression(contextNode);
  }
  else if (t.isClassDeclaration(contextNode)) {
    ctx = { type: K.TYPE_CLASS }; // TODO
  }

  return ctx;
};

function castExpressionValue(expr) {
  if (t.isArrayExpression(expr)) {
    return expr.elements.map(castExpressionValue);
  }
  else if (t.isLiteral(expr)) {
    return expr.value;
  }
}

function parseFunctionExpression(node) {
  var defaults = node.defaults || [];

  return {
    type: K.TYPE_FUNCTION,
    params: node.params.map(function(param, i) {
      return {
        name: param.name,
        defaultValue: castExpressionValue(defaults[i])
      }
    })
  };
}

function parseLiteral(node) {
  return {
    type: K.TYPE_LITERAL,
    value: castExpressionValue(node)
  };
}

function parseObjectExpression(/*expr*/) {
  return {
    type: K.TYPE_OBJECT,
    properties: [] // TODO
  }
}
function parseArrayExpression(/*expr*/) {
  return {
    type: K.TYPE_ARRAY,
    values: [] // TODO
  }
}
