var K = require('./constants');
var DocClassifier = require('./DocClassifier');
var _ = require('lodash');
var DocUtils = require('./DocUtils');
var ASTUtils = require('./ASTUtils');
var assign = _.assign;

/**
 * @param {Docstring} docstring
 * @param {NodeInfo} nodeInfo
 * @param {String} filePath
 */
function Doc(docstring, nodeInfo, filePath) {
  this.consumeDocstring(docstring);
  this.consumeNodeInfo(nodeInfo);

  this.filePath = filePath;

  return this;
}

Object.defineProperty(Doc.prototype, 'id', {
  get: function() {
    return DocUtils.getIdOf(this);
  }
});

Doc.prototype.toJSON = function(registry) {
  var nodeInfo = this.nodeInfo;
  var doc = assign({},
    this.docstring.toJSON(),
    this.nodeInfo.toJSON()
  );

  doc.type = DocUtils.getTypeNameOf(this);
  doc.nodeInfo = this.nodeInfo.ctx;

  doc.id = this.id;
  doc.name = this.generateName();
  doc.filePath = this.filePath;
  doc.isModule = this.isModule();

  if (!doc.isModule) {
    var resolvedContext = DocUtils.getReceiverAndScopeFor(this, registry);

    doc.receiver = resolvedContext.receiver;

    // scope
    if (resolvedContext.scope) {
      doc.nodeInfo.scope = resolvedContext.scope;
    }
    else {
      if (nodeInfo.isInstanceEntity()) {
        doc.nodeInfo.scope = K.SCOPE_INSTANCE;
      }
      else if (nodeInfo.isPrototypeEntity()) {
        doc.nodeInfo.scope = K.SCOPE_PROTOTYPE;
      }
      // blegh
      else if (
        ASTUtils.isFactoryModuleReturnEntity(
          this.$path.node,
          this.$path,
          registry
        )
      ) {
        doc.nodeInfo.scope = K.SCOPE_FACTORY_EXPORTS;
      }
    }

    doc.symbol = generateSymbol(this);
    doc.id = doc.receiver + doc.symbol + this.id;
  }

  doc.mixinTargets = doc.tags
    .filter(function(tag) { return tag.type === 'mixes'; })
    .reduce(function(list, tag) { return list.concat(tag.mixinTargets); }, [])
  ;

  doc.aliases = Object.keys(this.docstring.aliases);

  // we'll need this for @preserveOrder support
  if (doc.loc) {
    doc.line = doc.loc.start.line;
    doc.tags.forEach(function(tag) {
      tag.line = doc.line;
    });
  }

  return doc;
};

Doc.prototype.consumeDocstring = function(docstring) {
  this.docstring = docstring;
};

Doc.prototype.consumeNodeInfo = function(nodeInfo) {
  this.nodeInfo = nodeInfo;
};

Doc.prototype.generateId = function() {
  return DocUtils.getIdOf(this);
};

Doc.prototype.generateName = function() {
  return DocUtils.getNameOf(this);
};

Doc.prototype.markAsExported = function() {
  this.$isExported = true;
};

Doc.prototype.isExported = function() {
  return this.$isExported;
};

Doc.prototype.isModule = function() {
  return DocUtils.isModule(this);
};

function generateSymbol(doc) {
  if (DocClassifier.isStaticMember(doc)) {
    return '.';
  }
  else if (DocClassifier.isMethod(doc)) {
    return '#';
  }
  else if (DocClassifier.isMember(doc)) {
    return '@';
  }
};

module.exports = Doc;