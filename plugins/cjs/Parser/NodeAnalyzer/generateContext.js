var K = require('../constants');
var recast = require('recast');
var n = recast.types.namedTypes;

module.exports = function generateContext(contextNode) {
  var ctx;

  if (n.FunctionExpression.check(contextNode) || n.FunctionDeclaration.check(contextNode)) {
    ctx = parseFunctionExpression(contextNode);
  }
  else if (n.VariableDeclarator.check(contextNode)) {
    return generateContext(contextNode.init);
  }
  else if (n.Literal.check(contextNode)) {
    ctx = parseLiteral(contextNode);
  }
  else if (n.ObjectExpression.check(contextNode)) {
    ctx = parseObjectExpression(contextNode);
  }
  else if (n.ArrayExpression.check(contextNode)) {
    ctx = parseArrayExpression(contextNode);
  }
  else if (n.ClassDeclaration.check(contextNode)) {
    ctx = { type: K.TYPE_CLASS }; // TODO
  }

  return ctx;
};

function castExpressionValue(expr) {
  if (n.ArrayExpression.check(expr)) {
    return expr.elements.map(castExpressionValue);
  }
  else if (n.Literal.check(expr)) {
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
