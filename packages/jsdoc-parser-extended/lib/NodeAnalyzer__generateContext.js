var K = require('./constants');
var t = require('babel-types');

module.exports = parseNode;

function parseNode(contextNode) {
  if (
    t.isFunctionExpression(contextNode) ||
    t.isFunctionDeclaration(contextNode) ||
    t.isObjectMethod(contextNode)
  ) {
    return parseFunctionExpression(contextNode);
  }
  else if (t.isVariableDeclarator(contextNode)) {
    return parseNode(contextNode.init);
  }
  else if (t.isVariableDeclaration(contextNode)) {
    return parseNode(contextNode.declarations[0]);
  }
  else if (t.isLiteral(contextNode)) {
    return parseLiteral(contextNode);
  }
  else if (t.isObjectExpression(contextNode)) {
    return parseObjectExpression(contextNode);
  }
  else if (t.isArrayExpression(contextNode)) {
    return parseArrayExpression(contextNode);
  }
  else if (t.isClassDeclaration(contextNode)) {
    return { type: K.TYPE_CLASS }; // TODO
  }
  else if (t.isObjectProperty(contextNode) && t.isIdentifier(contextNode.key)) {
    return {
      type: K.OBJECT_PROPERTY,
      key: contextNode.key.name,
      value: parseNode(contextNode.value),
    }
  }
};

function parseFunctionExpression(node) {
  return {
    type: K.TYPE_FUNCTION,
    params: node.params.map(function(param) {
      return parseFunctionParameter(param);
    })
  };
}

function parseLiteral(node) {
  return {
    type: K.TYPE_LITERAL,
    value: node.value
  };
}

function parseObjectExpression(expr) {
  return {
    type: K.TYPE_OBJECT,
    properties: expr.properties.map(parseNode)
  }
}

function parseArrayExpression(expr) {
  return {
    type: K.TYPE_ARRAY,
    elements: expr.elements.map(parseNode)
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