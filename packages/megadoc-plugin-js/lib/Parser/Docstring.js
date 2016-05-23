// var dox = require('dox');
var parseComment = require('./parseComment');
var assert = require('assert');
var _ = require('lodash');
var K = require('./constants');
var Tag = require('./Docstring__Tag');
var extractIdInfo = require('./Docstring__extractIdInfo');
var collectDescription = require('./Docstring__collectDescription');

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
    throw new Error('Invalid annotation in comment block. Source:\n' + comment);
  }

  assert(commentNode.length === 1,
    'Comment parser should yield a single node, not ' + commentNode.length + '! ' +
    'Source:\n' + comment
  );

  this.tags = commentNode[0].tags.map(function(doxTag) {
    return new Tag(doxTag, options || {}, filePath);
  });

  idInfo = extractIdInfo(this.tags);

  // this.id = idInfo.id;
  this.name = idInfo.name;
  this.namespace = idInfo.namespace;
  this.description = collectDescription(commentNode[0], this.id, this.tags);
  this.aliases = this.tags.filter(function(tag) {
    return tag.type === 'alias';
  }).reduce(function(map, tag) {
    map[tag.typeInfo.name] = true;
    return map;
  }, {});

  this.$location = (
    (this.namespace ? this.namespace + K.NAMESPACE_SEP : '') +
    (this.name || '') + ' in ' +
    filePath
  );

  return this;
}

var Dpt = Docstring.prototype;

/**
 * @return {Object} doc
 *
 * @return {String} doc.name
 *         If this is a module, it will be the name of the module found in a
 *         @module tag, or a @name tag. Otherwise, it's what may be found in a
 *         @name tag, a @property tag, or a @method tag. See [extractIdInfo]().
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
    'name',
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
  return this.getTag('memberOf').typeInfo.name;
};

Dpt.hasTag = function(type) {
  return this.tags.some(findByType(type));
};

Dpt.getTag = function(type) {
  return this.tags.filter(findByType(type))[0];
};

Dpt.hasAlias = function(alias) {
  return alias in this.aliases;
};

Dpt.hasTypeOverride = function() {
  return getTypeOverridingTags(this.tags).length > 0;
};

Dpt.getTypeOverride = function() {
  var typedTags = getTypeOverridingTags(this.tags);

  if (typedTags.length > 1) {
    console.warn("Document has multiple type overrides! Source: %s",
      this.$location
    );
  }

  return typedTags[0].typeInfo.type;
};

Dpt.overrideNamespace = function(namespace) {
  this.namespace = namespace;
};

Dpt.addAlias = function(name) {
  this.aliases[name] = true;
};

module.exports = Docstring;

function getTypeOverridingTags(tags) {
  return tags.filter(function(tag) {
    return tag.type in K.TYPE_OVERRIDING_TAGS;
  });
}

function findByType(type) {
  return function(x) {
    return x.type === type;
  }
}