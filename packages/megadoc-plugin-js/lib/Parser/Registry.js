var WeakMap = require('weakmap');
var ASTUtils = require('./ASTUtils');
var DocUtils = require('./DocUtils');
var assert = require('assert');

/**
 * A registry of all the docs and their AST nodes and paths.
 */
function Registry() {
  /**
   * @property {Object[]} docs
   *
   * lololo
   */
  this.docs = [];
  this.docPaths = new WeakMap();
  this.lends = new WeakMap();
}

/** @lends Registry.prototype */
var Rpt = Registry.prototype;

Rpt.addModuleDoc = function(doc, path, filePath) {
  this.trackModuleDocAtPath(doc, path);

  assert(!!doc.id, "A document must have an id!");

  if (this.get(doc.id)) {
    console.warn('You are attempting to overwrite an existing doc entry! This is very bad.',
      doc.id,
      filePath + ':' + ASTUtils.getLocation(path.node).start.line
    );
  }

  this.docs.push(doc);
};

Rpt.trackModuleDocAtPath = function(doc, path) {
  if (path) {
    this.docPaths.set(path, doc);
    doc.$path = path;
  }
};

Rpt.getModuleDocAtPath = function(path) {
  return this.docPaths.get(path);
};

Rpt.addEntityDoc = function(doc, path) {
  this.docs.push(doc);
  doc.$path = path;
};

Rpt.trackLend = function(lendsTo, path) {
  var targetPath = ASTUtils.findNearestPathWithComments(path);

  this.lends.set(targetPath, {
    receiver: lendsTo
  });
};

Rpt.remove = function(doc) {
  var index = this.docs.indexOf(doc);
  if (index > -1) {
    this.docs.splice(index, 1);
  }
}

Rpt.get = function(id, filePath) {
  return this.docs.filter(function(doc) {
    if (filePath && doc.filePath !== filePath) {
      return false;
    }

    return (
      DocUtils.getIdOf(doc) === id ||
      doc.docstring.hasAlias(id)
    );
  })[0] || this.docs.filter(function(doc) { // TODO: optimize
    return DocUtils.getNameOf(doc) === id;
  })[0];
};

/**
 * Locate the first (if any) module doc whose path is an ancestor of the given
 * path.
 *
 * @param  {recast.path} path
 * @return {String}
 *         The module ID.
 */
Rpt.findClosestModule = function(path) {
  var receiverDoc = this.findEnclosingDoc(path, this.docPaths);

  if (receiverDoc && DocUtils.isModule(receiverDoc)) {
    return receiverDoc.id;
  }
};

/**
 * Locate the closest @lend doc to a given path.
 *
 * @param {recast.path} path
 *
 * @return {Object} lendEntry
 *
 * @return {String} lendEntry.receiver
 *         The target of the @lends.
 *
 * @return {String} [lendEntry.scope]
 *         Could be a "prototype" if `@lends Something.prototype`.
 */
Rpt.findClosestLend = function(path) {
  return this.findEnclosingDoc(path, this.lends);
};

/**
 * This will look for an identifier that has a @lends entry. For example:
 *
 *     /** @lends Something * /
 *     var helpers = {};
 *
 *     /** @module * /
 *     var Something = {};
 *
 *     helpers.someProp = '5'; // <- at this path, we will locate "helpers"
 *                             // above
 *
 * @param  {recast.path} path
 * @param  {String} alias
 *         The name of the identifier. In the example above, this will be
 *         "helpers" (as this will be the receiver we parse during analysis.)
 *
 * @return {Object} lendEntry
 */
Rpt.findAliasedLendTarget = function(path, alias) {
  var identifierPath = ASTUtils.findIdentifierInScope(alias, path);

  if (identifierPath) {
    var targetPath = ASTUtils.findNearestPathWithComments(identifierPath);

    if (targetPath) {
      return this.lends.get(targetPath);
    }
  }
};

/**
 * @return {String}
 *         The actual/resolved receiver.
 */
Rpt.findAliasedReceiver = function(alias) {
  var docs = this.docs.filter(function(doc) {
    return doc.docstring.hasAlias(alias);
  });

  if (docs.length > 1) {
    console.warn("Multiple documents are using the same alias '%s': %s",
      alias,
      JSON.stringify(docs.map(function(x) { return x.id; }))
    );
  }

  return docs[0] && docs[0].id;
};

Rpt.findEnclosingDoc = function(startingPath, map) {
  var doc;

  ASTUtils.findAncestorPath(startingPath, function(path) {
    return Boolean(doc = map.get(path));
  });

  return doc;
};

Rpt.findExportedModule = function(filePath) {
  return this.docs.filter(function(doc) {
    return doc.isModule() && doc.filePath === filePath;
  })[0];
};

Object.defineProperty(Rpt, 'size', {
  get: function() {
    return this.docs.length;
  }
});

module.exports = Registry;