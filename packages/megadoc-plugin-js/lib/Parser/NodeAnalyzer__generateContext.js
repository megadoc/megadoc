var K = require('./constants');
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
  return {
    type: K.TYPE_FUNCTION,
    params: node.params.map(function(param, i) {
      return parseFunctionParameter(param);
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

// ESprima seems to annotate FunctionDeclaration nodes with a "defaults" property
// that is an array of Literal nodes that map to parameter default values,
// however, babel doesn't seem to do it this way; instead, it's using an
// AssignmentPattern to reflect the defaults. So for:
//
//     function x(a, b = 5) {}
//
// We get something like:
//
//     [FunctionDeclaration |
//       params: [Array |
//         [Node.Identifier],
//         [Node.AssignmentPattern|
//           left: Node,
//           right: Node
//         ]
//       ]
//     ]
function parseFunctionParameter(node) {
  if (t.isIdentifier(node)) {
    return { name: node.name };
  }
  else if (t.isAssignmentPattern(node)) {
    return {
      name: node.left.name,
      defaultValue: node.right.value
    };
  }
}