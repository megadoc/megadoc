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
function Docstring(comment, params) {
  if (arguments.length === 1 && typeof comment === 'object') {
    return Object.assign(this, comment);
  }

  var commentNode;

  try {
    commentNode = parseComment(comment);
  }
  catch(e) {
    throw new Error('comment could not be parsed: "' + e.message + '":\n' + comment);
  }

  if (commentNode.length === 0) {
    if (params.ignoreCommentParseError) {
      commentNode = [{ tags: [] }];
    }
    else {
      throw new Error('invalid annotation in comment block:\n' + comment);
    }
  }

  assert(commentNode.length === 1,
    'Comment parser should yield a single node, not ' + commentNode.length + '! ' +
    'Source:\n' + comment
  );

  this.tags = commentNode[0].tags.map(function(tagNode) {
    return new Tag(tagNode, params);
  });

  const typeDefInfo = extractTypeDefs(this.tags);
  const tagsWithoutTypeDefs = typeDefInfo.tags;
  const inferredData = prepareFromTags(commentNode[0], params, tagsWithoutTypeDefs);

  Object.assign(this, inferredData, {
    tags: tagsWithoutTypeDefs
  });

  this.typeDefs = typeDefInfo.typeDefs.map(typeDef => {
    return Object.assign({}, typeDef, prepareFromTags({ description: '' }, params, typeDef.tags), {
      name: typeDef.name,
      namespace: inferredData.namespace
    });
  });

  return this;
}

function prepareFromTags(commentNode, { nodeLocation, config }, tags) {
  const info = {};
  const idInfo = extractIdInfo(tags, { inferNamespaces: config.inferNamespaces });

  info.name = idInfo.name;
  info.namespace = idInfo.namespace;
  info.description = collectDescription(commentNode, null, tags);

  info.aliases = tags.filter(function(tag) {
    return tag.type === 'alias';
  }).reduce(function(map, tag) {
    map[tag.typeInfo.name] = true;
    return map;
  }, {});

  info.$location = (
    (idInfo.namespace ? idInfo.namespace + K.NAMESPACE_SEP : '') +
    (idInfo.name || '') +
    ' in ' +
    nodeLocation
  );

  return info;
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
  return this.hasTag('module') || this.hasTag('class');
};

Dpt.isInternal = function() {
  return this.hasTag('internal') || this.hasTag('ignoredoc');
};

Dpt.doesLend = function() {
  return this.hasTag('lends');
};

Dpt.getLentTo = function() {
  return this.getTag('lends').typeInfo.name;
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

Dpt.markedAsExportedSymbol = function() {
  return this.hasTag('export');
}

Dpt.getTypeOverride = function() {
  var typedTags = getTypeOverridingTags(this.tags);

  if (typedTags.filter(x => x.type !== 'property').length > 1) {
    console.warn("%s: Document has multiple type overrides! %s",
      this.$location,
      JSON.stringify(typedTags.map(x => x && x.typeInfo && x.typeInfo))
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
    return K.TYPE_OVERRIDING_TAGS[tag.type] === true;
  });
}

function findByType(type) {
  return function(x) {
    return x.type === type;
  }
}

function extractTypeDefs(tags) {
  return tags.reduce(function(state, tag) {
    if (tag.type === 'callback' || tag.type === 'typedef') {
      state.typeDefs.push({
        name: tag.typeInfo.name,
        tags: [ tag ],
      });
    }
    else if (state.typeDefs.length) {
      state.typeDefs[state.typeDefs.length-1].tags.push(tag);
    }
    else {
      state.tags.push(tag);
    }

    return state;
  }, {
    tags: [],
    typeDefs: [],
  });
};
