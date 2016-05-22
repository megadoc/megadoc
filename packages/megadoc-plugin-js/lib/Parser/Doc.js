var K = require('./constants');
var DocClassifier = require('./DocClassifier');
var _ = require('lodash');
var findWhere = _.findWhere;
var assign = _.assign;
var assert = require('assert');
var debuglog = require('megadoc/lib/Logger')('megadoc').info;

/**
 * @param {Docstring} docstring
 * @param {NodeInfo} nodeInfo
 * @param {String} filePath
 * @param {String} absoluteFilePath
 */
function Doc(docstring, nodeInfo, filePath, absoluteFilePath) {
  this.consumeDocstring(docstring);
  this.consumeNodeInfo(nodeInfo);

  this.id = this.generateId();
  this.name = this.generateName();
  this.filePath = filePath;
  this.absoluteFilePath = absoluteFilePath;
  this.customAliases = [];

  return this;
}

Doc.prototype.toJSON = function() {
  var doc = assign({}, this.docstring.toJSON(), this.nodeInfo.toJSON());

  doc.id = this.id;
  doc.name = this.generateName();
  doc.filePath = this.filePath;
  doc.absoluteFilePath = this.absoluteFilePath;
  doc.isModule = this.isModule();
  doc.receiver = this.getReceiver();
  doc.mixinTargets = doc.tags.filter(function(tag) {
    return tag.type === 'mixes';
  }).reduce(function(list, tag) {
    return list.concat(tag.mixinTargets);
  }, []);

  doc.aliases = doc.tags.filter(function(tag) {
    return tag.type === 'alias';
  }).map(function(tag) {
    return tag.alias;
  }).concat(this.customAliases);

  // support for explicit typing using tags like @method or @type
  // if (this.docstring.hasTypeOverride()) {
  //   doc.ctx.type = this.docstring.getTypeOverride();
  // }

  if (!doc.isModule) {
    doc.ctx.symbol = this.generateSymbol(doc.ctx.type);
    doc.id = [ doc.receiver, doc.id ].join(doc.ctx.symbol);
    doc.path = [ doc.receiver, doc.name ].join(doc.ctx.symbol);
  }
  else {
    doc.path = doc.id;
  }

  // we'll need this for @preserveOrder support
  if (doc.loc) {
    doc.line = doc.loc.start.line;
    doc.tags.forEach(function(tag) {
      tag.line = doc.line;
    });
  }

  this.useSourceNameWhereNeeded(doc.name, doc);

  return doc;
};

Doc.prototype.consumeDocstring = function(docstring) {
  this.docstring = docstring;
};

Doc.prototype.consumeNodeInfo = function(nodeInfo) {
  this.nodeInfo = nodeInfo;
};

Doc.prototype.generateId = function() {
  var id = this.docstring.id || this.nodeInfo.id;
  var namespace = this.docstring.namespace;

  if (id && namespace && id.indexOf(namespace) === -1) {
    id = [ namespace, id ].join(K.NAMESPACE_SEP);
  }

  return id;
};

Doc.prototype.generateName = function() {
  if (this.docstring.namespace && this.id) {
    return this.id.replace(this.docstring.namespace + K.NAMESPACE_SEP, '');
  }
  else {
    return this.id;
  }
};

Doc.prototype.markAsExported = function() {
  this.$isExported = true;
};

Doc.prototype.isExported = function() {
  return this.$isExported;
};

Doc.prototype.isModule = function() {
  return !this.docstring.hasMemberOf() && (
    this.isExported() ||
    this.docstring.isModule() ||
    this.nodeInfo.isModule()
  );
};

Doc.prototype.generateSymbol = function() {
  // var symbol;

  // if (typeof type === 'object') {
  //   type = type.name;
  // }

  // console.log(type)

  if (DocClassifier.isStaticMember(this)) {
    return '.';
  }
  else if (DocClassifier.isMethod(this)) {
    return '#';
  }
  else if (DocClassifier.isMember(this)) {
    return '@';
  }
  // }

  // switch(type) {
  //   case K.TYPE_FUNCTION:
  //     if (DocClassifier.isStaticMethod(this)) {
  //       symbol = '.';
  //     }
  //     else {
  //       symbol = '#';
  //     }
  //     break;

  //   default:
  //     if (DocClassifier.isObjectProperty(this)) {
  //       symbol = '@';
  //     }
  //     else {
  //       symbol = '.';
  //     }
  //     break;
  // }

  // if (this.docstring.hasTag('property') && !this.docstring.hasTag('static')) {
  //   symbol = '@';
  // }

  // if (this.docstring.hasTag('property') && this.docstring.hasTag('static')) {
  //   symbol = '.';
  // }

  // return symbol;
};

/**
 * Set the correct receiver for this doc. The receiver might not have been
 * resolved correctly in NodeInfo due to @lends or module aliases.
 *
 * @param  {String} correctedReceiver
 *         Name of the new receiver.
 */
Doc.prototype.overrideReceiver = function(correctedReceiver) {
  assert(!!correctedReceiver,
    "You are attempting to override a receiver with an undefined one!"
  );

  debuglog(
    'Adjusting receiver from "%s" to "%s" for "%s" (scope: %s)',
    this.nodeInfo.receiver,
    correctedReceiver,
    this.id,
    this.nodeInfo.ctx && this.nodeInfo.ctx.scope
  );

  this.$correctedReceiver = correctedReceiver;
};

Doc.prototype.getReceiver = function() {
  return this.$correctedReceiver || this.nodeInfo.receiver;
};

Doc.prototype.hasReceiver = function() {
  return Boolean(this.getReceiver());
};

Doc.prototype.useSourceNameWhereNeeded = function(name, doc) {
  var propertyTag = findWhere(doc.tags, { type: 'property' });
  if (propertyTag && !propertyTag.typeInfo.name) {
    propertyTag.typeInfo.name = name;
  }
};

Doc.prototype.addAlias = function(name) {
  this.customAliases.push(name);
};

module.exports = Doc;