var t = require('babel-types');
var parsePropTypes = require('./parsePropTypes');
var parseStatics = require('./parseStatics');
var parseDisplayName = require('./parseDisplayName');

function analyzeReactNode(n, node, path, nodeInfo) {
  if (t.isVariableDeclaration(node)) {
    analyzeCallExpression(n, node.declarations[0].init, path, nodeInfo);
  }
  else if (t.isExpressionStatement(node) && t.isAssignmentExpression(node.expression)) {
    analyzeCallExpression(n, node.expression.right, path, nodeInfo);
  }

  if (nodeInfo.ctx.type === 'component') {
    if (nodeInfo.ctx.displayName) {
      nodeInfo.id = nodeInfo.ctx.displayName;
    }
  }
}

function analyzeCallExpression(n, node, path, nodeInfo) {
  if (t.isCallExpression(node) && t.isMemberExpression(node.callee)) {
    var callee = node.callee;

    if (callee.object.name === 'React' && callee.property.name === 'createClass') {
      var componentTypeDefinition = node.arguments[0];

      nodeInfo.markAsModule();
      nodeInfo.setContext({
        type: 'component',
        displayName: parseDisplayName(componentTypeDefinition),
        propTypes: parsePropTypes(componentTypeDefinition, nodeInfo.filePath),
        statics: parseStatics(componentTypeDefinition)
      });
    }
  }
}
module.exports = analyzeReactNode;