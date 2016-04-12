var nodejsPath = require('path');
var recast = require('recast');
var n = recast.types.namedTypes;

var Utils = exports;

Utils.isModuleExports = function(node) {
  return (
    n.MemberExpression.check(node.left)
    && node.left.object.name === 'module'
    && node.left.property.name === 'exports'
    && (
      n.Identifier.check(node.right)
      || n.FunctionExpression.check(node.right)
    )
  );
};

Utils.isExports = function(node) {
  var decl = node.declarations[0];

  return (
        n.Identifier.check(decl.id)
    &&  n.Identifier.check(decl.init)
    &&  decl.init.name === 'exports'
  );
};

Utils.isPrototypeProperty = function(node) {
  return (
    n.MemberExpression.check(node)
    && n.MemberExpression.check(node.object)
    && n.Identifier.check(node.object.object)
    && n.Identifier.check(node.object.property)
    && node.object.property.name === 'prototype'
  );
};

Utils.isInstanceEntity = function(node) {
  return n.ThisExpression.check(node);
};

Utils.isFactoryModuleReturnEntity = function(node, startingPath, registry) {
  var modulePath = Utils.findAncestorPath(startingPath, function(path) {
    var doc = registry.getModuleDocAtPath(path);

    return (
      doc &&
      doc.isModule() &&
      doc.nodeInfo.ctx.type === 'function'
    );
  });

  return !!modulePath;
};

Utils.getVariableNameFromModuleExports = function(node) {
  var name;

  if (n.FunctionExpression.check(node.right) && n.Identifier.check(node.right.id)) {
    name = node.right.id.name;
  }
  else {
    name = node.right.name;
  }

  return name;
};

Utils.getVariableNameFromFilePath = function(filePath) {
  return nodejsPath.basename(filePath, nodejsPath.extname(filePath));
};

Utils.flattenNodePath = function(node, fragments) {
  if (!fragments) {
    fragments = [];
  }

  if (n.Identifier.check(node.object) && n.Identifier.check(node.property)) {
    fragments.push(node.object.name);
    fragments.push(node.property.name);
  }
  else if (n.MemberExpression.check(node.object)) {
    Utils.flattenNodePath(node.object, fragments);
  }

  return fragments.join('.');
};

Utils.findAncestorPath = function(startingPath, cond) {
  var path = startingPath;

  while ((path = path.parentPath)) {
    if (cond(path)) {
      return path;
    }
  }
};

Utils.findScope = function(path) {
  var scope;

  do {
    scope = path.scope;
  } while (!scope && path && (path = path.parentPath));

  return scope;
};

Utils.findNearestPathWithComments = function(startingPath) {
  return Utils.findAncestorPath(startingPath, function(path) {
    return Boolean(path.value.comments);
  });
};

Utils.dumpLocation = function(node, filePath) {
  return [filePath, node.loc.start.line].join(':');
};

/**
 * Locates an Identifier node with a given name in the enclosing scopes.
 *
 * @param  {String} identifierName
 * @param  {recast.path} path
 *         The path whose scope we should start looking from.
 *
 * @return {recast.path}
 *         The path to the Identifier node, if any.
 */
Utils.findIdentifierInScope = function(identifierName, path) {
  var currentScope = Utils.findScope(path);

  if (currentScope) {
    var targetScope = currentScope.lookup(identifierName);

    if (targetScope) {
      return targetScope.getBindings()[identifierName][0];
    }
  }
};