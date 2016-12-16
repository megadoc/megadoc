var _ = require('lodash');
var assign = _.assign;

function parseNode(node) {
  var ctx = { type: '?' };
  var idInfo;

  if (node.type === 'FunctionDeclaration') {
    idInfo = parseNodeId(node.identifier);
    ctx = parseNodeContext(node);
  }
  else if (node.type === 'LocalStatement') {
    if (node.variables.length === 1) {
      idInfo = { id: node.variables[0].name };

      if (node.init[0]) {
        ctx = parseNodeContext(node.init[0]);
      }
    }
  }
  else if (node.type === 'AssignmentStatement') {
    if (node.variables.length === 1) {
      idInfo = parseNodeId(node.variables[0]);

      if (node.init[0]) {
        ctx = parseNodeContext(node.init[0]);
      }
    }
  }
  else if (node.type === 'TableKeyString') {
    idInfo = parseNodeId(node);
    ctx = parseNodeContext(node.value);
  }

  if (idInfo) {
    return assign({}, idInfo, { ctx: ctx });
  }
  else {
    console.info('Unknown node type "%s"', node.type);
    return { ctx: ctx };
  }
}

function parseNodeId(node) {
  var idInfo = {};

  if (node.type === 'Identifier') {
    idInfo.id = node.name;
  }
  else if (node.type === 'MemberExpression') {
    idInfo.receiver = node.base.name;
    idInfo.id = node.identifier.name;
    idInfo.indexer = node.indexer;
  }
  else if (node.type === 'TableKeyString') {
    idInfo.id = node.key.name;
  }

  return idInfo;
}
function parseNodeContext(node) {
  var ctx = { type: '?' };

  if (node.type === 'StringLiteral') {
    return { type: 'literal' };
  }
  else if (node.type === 'FunctionDeclaration') {
    ctx.type = 'function';
    ctx.params = node.parameters;
  }
  else if (node.type === 'TableConstructorExpression') {
    ctx.type = 'table';
  }

  return ctx;
}

module.exports = parseNode;