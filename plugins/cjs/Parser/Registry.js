var WeakMap = require('weakmap');
var Utils = require('./Utils');
var assert = require('assert');

function Registry() {
  this.docs = [];
  this.docPaths = new WeakMap();
  this.lends = new WeakMap();
}

var Rpt = Registry.prototype;

Rpt.addModuleDoc = function(doc, path) {
  this.trackModuleDocAtPath(doc, path);

  assert(!!doc.id, "A document must have an id!");

  if (this.get(doc.id)) {
    console.warn('You are attempting to overwrite an existing doc entry! This is very bad.', doc.id);
  }

  this.docs.push(doc);
};

Rpt.trackModuleDocAtPath = function(doc, path) {
  var targetPath = Utils.findNearestPathWithComments(path);

  if (targetPath) {
    this.docPaths.set(targetPath, doc);
    doc.$path = targetPath;
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
  var targetPath = Utils.findNearestPathWithComments(path);

  this.lends.set(targetPath, lendsTo);
};

Rpt.remove = function(doc) {
  var index = this.docs.indexOf(doc);
  if (index > -1) {
    this.docs.splice(index, 1);
  }
}

Rpt.get = function(id, filePath) {
  return this.docs.filter(function(doc) {
    return (doc.id === id || doc.name === id) && (
      filePath ? doc.filePath === filePath : true
    );
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
Rpt.findClosestModuleToPath = function(path) {
  var receiverDoc = this.findEnclosingDoc(path, this.docPaths);

  if (receiverDoc) {
    return receiverDoc.id;
  }
  else {
    var lentTo = this.findEnclosingDoc(path, this.lends);

    if (lentTo) {
      return this.get(lentTo).id;
    }
  }
};

Rpt.findAliasedReceiver = function(path, alias) {
  var identifierPath = Utils.findIdentifierInScope(alias, path);

  if (identifierPath) {
    var receiverPath = Utils.findNearestPathWithComments(identifierPath);

    if (receiverPath) {
      var lentTo = this.lends.get(receiverPath);
      if (lentTo) {
        return lentTo;
      }
      else {
        var receiverDoc = this.getModuleDocAtPath(receiverPath);
        if (receiverDoc) {
          if (receiverDoc.id !== alias) {
            return receiverDoc.id;
          }
        }
      }
    }
  }
};

Rpt.findEnclosingDoc = function(startingPath, map) {
  var doc;

  Utils.findAncestorPath(startingPath, function(path) {
    return Boolean(doc = map.get(path));
  });

  return doc;
};

Object.defineProperty(Rpt, 'size', {
  get: function() {
    return this.docs.length;
  }
});

module.exports = Registry;