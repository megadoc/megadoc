var nodejsPath = require('path');
var t = require('babel-types');
var K = require('./constants');
var DocUtils = require('./DocUtils');

var Utils = exports;

Utils.isModuleExports = function(node) {
  return (
    t.isMemberExpression(node.left)
    && node.left.object.name === 'module'
    && node.left.property.name === 'exports'
    && (
      t.isIdentifier(node.right)
      || t.isFunctionExpression(node.right)
    )
  );
};

Utils.isExports = function(node) {
  var decl = node.declarations[0];

  return (
        t.isIdentifier(decl.id)
    &&  t.isIdentifier(decl.init)
    &&  decl.init.name === 'exports'
  );
};

Utils.isPrototypeProperty = function(node) {
  return (
    t.isMemberExpression(node)
    && t.isMemberExpression(node.object)
    && t.isIdentifier(node.object.object)
    && t.isIdentifier(node.object.property)
    && node.object.property.name === 'prototype'
  );
};

Utils.isInstanceEntity = function(node) {
  return t.isThisExpression(node);
};

Utils.isFactoryModuleReturnEntity = function(node, startingPath, registry) {

  var modulePath = Utils.findAncestorPath(startingPath, function(path) {
    var doc = registry.getModuleDocAtPath(path);

    return (
      doc &&
      doc.isModule() &&
      DocUtils.isOfType(doc, K.TYPE_FUNCTION)
    );
  });

  return !!modulePath;
};

Utils.getVariableNameFromModuleExports = function(node) {
  var name;

  if (t.isFunctionExpression(node.right) && t.isIdentifier(node.right.id)) {
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

  if (t.isIdentifier(node.object) && t.isIdentifier(node.property)) {
    fragments.push(node.object.name);
    fragments.push(node.property.name);
  }
  else if (t.isMemberExpression(node.object)) {
    Utils.flattenNodePath(node.object, fragments);
  }

  return fragments.join('.');
};

Utils.findAncestorPath = function(startingPath, cond) {
  var path = startingPath;

  do {
    if (cond(path)) {
      return path;
    }
  } while ((path = path.parentPath));
};

Utils.findScope = function(path) {
  var scope;

  do {
    scope = path.scope;
  } while (!scope && ((path = path.parentPath)));

  return scope;
};

Utils.findNearestPathWithComments = function(startingPath) {
  return Utils.findAncestorPath(startingPath, function(path) {
    // return Boolean(path.value.comments);
    return Boolean(path.node.leadingComments);
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
    var targetScope = currentScope.getBinding(identifierName);

    // for (var x in currentScope) {
    //   if (typeof currentScope[x] === 'function')
    //     console.log('#' + x);
    // }
    return targetScope && targetScope.path;
    // console.log(targetScope)
    // if (targetScope) {
    //   console.log(targetScope)
    //   return targetScope.getBinding(identifierName)[0];
    // }
  }
};

Utils.getLocation = function(node) {
  var loc;

  if ('VariableDeclaration' === node.type && node.declarations[0].init) {
    loc = node.declarations[0].init.loc;
  }
  else {
    loc = node.loc;
  }

  return loc || { start: {}, end: {} };
};