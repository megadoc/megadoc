// var dox = require('dox');
var parseComment = require('./parseComment');
var assert = require('assert');
var _ = require('lodash');
var K = require('./constants');
var Tag = require('./Docstring/Tag');
var extractIdInfo = require('./Docstring/extractIdInfo');
var collectDescription = require('./Docstring/collectDescription');
var findWhere = _.findWhere;

/**
 * An object representing a JSDoc comment (parsed using dox).
 *
 * @param {String} comment
 *        The JSDoc-compatible comment string to build from.
 */
function Docstring(comment, options, filePath) {
  var commentNode, idInfo;

  try {
    commentNode = parseComment(comment);
  }
  catch(e) {
    throw new Error('Comment parse failed: "' + e.message + '" Source:\n' + comment);
  }

  if (commentNode.length === 0) {
    throw new Error('No content found in comment. Source:\n' + comment);
  }
  else if (commentNode.length > 1) {
    throw new Error(
      'Comment should not contain more than one block of documentaion.' +
      'Source:\n' + comment
    );
  }

  this.tags = commentNode[0].tags.map(function(doxTag) {
    return new Tag(doxTag, options || {}, filePath);
  });

  idInfo = extractIdInfo(this.tags);

  this.id = idInfo.id;
  this.namespace = idInfo.namespace;
  this.description = collectDescription(commentNode[0], this.id, this.tags);

  return this;
}

var Dpt = Docstring.prototype;

/**
 * @return {Object} doc
 *
 * @return {String} doc.id
 *         The explicit module id found in a @module tag, if any.
 *
 * @return {String} doc.namespace
 *         The namespace name found in a @namespace tag, if any.
 *
 * @return {String} doc.description
 *         The free-text found in the docstring.
 *
 * @return {Tag[]} doc.tags
 *         All the JSDoc tags found in the docstring.
 */
Docstring.prototype.toJSON = function() {
  var docstring = _.pick(this, [
    'id',
    'namespace',
    'description',
  ]);

  docstring.tags = this.tags.map(function(tag) {
    return tag.toJSON();
  });

  return docstring;
};

Dpt.isModule = function() {
  return this.hasTag('module');
};

Dpt.isInternal = function() {
  return this.hasTag('internal');
};

Dpt.isMethod = function() {
  return this.hasTag('method');
};

Dpt.doesLend = function() {
  return this.hasTag('lends');
};

Dpt.getLentTo = function() {
  return this.getTag('lends').lendReceiver;
};

Dpt.hasMemberOf = function() {
  return this.hasTag('memberOf');
};

Dpt.getExplicitReceiver = function() {
  return this.getTag('memberOf').explicitReceiver;
};

Dpt.hasTag = function(type) {
  return !!findWhere(this.tags, { type: type });
};

Dpt.getTag = function(type) {
  return findWhere(this.tags, { type: type });
};

Dpt.hasTypeOverride = function() {
  return this.tags.filter(function(tag) {
    return !!tag.explicitType;
  }).length > 0;
};

Dpt.getTypeOverride = function() {
  return this.tags.filter(function(tag) {
    return !!tag.explicitType;
  })[0].explicitType;
};

Dpt.overrideNamespace = function(namespace) {
  var oldNamespace = this.namespace;

  this.namespace = namespace;

  if (oldNamespace && this.id) {
    this.id = this.id.replace(oldNamespace + K.NAMESPACE_SEP, '');
  }

  // this will FUBAR if we have @namespace tags ...
};

module.exports = Docstring;