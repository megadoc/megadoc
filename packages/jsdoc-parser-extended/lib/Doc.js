var K = require('./constants');
var DocClassifier = require('./DocClassifier');
var DocUtils = require('./DocUtils');
var ASTUtils = require('./ASTUtils');
var Docstring = require('./Docstring');

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
  var plainNodeInfo = this.nodeInfo.toJSON();
  var plainDocstring = this.docstring.toJSON();

  // not all babel AST nodes are heterogeneous as far as "loc" goes, so we rely
  // on ASTUtils.getLocation to get to that property but it doesn't cover all
  // possible node types.. in which case we'll fallback to the location provided
  // by the Docstring which is less accurate but still good
  var effectiveLoc = plainNodeInfo.loc.start.line === '?' ?
    { start: { line: plainDocstring.loc ? plainDocstring.loc.line : '?' } } :
    { start: { line: plainNodeInfo.loc.start.line } }
  ;

  var doc = {
    aliases: null,
    description: plainDocstring.description,
    filePath: this.filePath,
    id: DocUtils.getIdOf(this),
    isModule: this.isModule(),
    isDefaultExportedSymbol: plainNodeInfo.isDefaultExportedSymbol,
    isExportedSymbol: plainNodeInfo.isExportedSymbol || this.docstring.markedAsExportedSymbol(),
    loc: effectiveLoc,
    // we'll need this for @preserveOrder support
    line: effectiveLoc.start.line,
    mixinTargets: null,
    name: DocUtils.getNameOf(this),
    namespace: plainDocstring.namespace,
    nodeInfo: this.nodeInfo.getContext(),
    receiver: plainNodeInfo.receiver,
    symbol: null,
    tags: plainDocstring.tags.map(tag => {
      // megadoc-plugin-js relies on this
      tag.line = tag.loc ? tag.loc.line : undefined

      return tag
    }),
    type: DocUtils.getTypeNameOf(this),
  };

  if (this.$isTypeDef) {
    doc.symbol = '~';
    doc.receiver = this.receiver;
    doc.id = (doc.receiver || '<<unknown>>') + doc.symbol + doc.id;
  }
  else if (!doc.isModule) {
    var resolvedContext = DocUtils.resolveReceiverAndScopeFor(this, registry);

    doc.receiver = resolvedContext.receiver;

    // scope
    if (resolvedContext.scope) {
      doc.nodeInfo.scope = resolvedContext.scope;
    }
    else {
      if (this.nodeInfo.isInstanceEntity()) {
        doc.nodeInfo.scope = K.SCOPE_INSTANCE;
      }
      else if (this.nodeInfo.isPrototypeEntity()) {
        doc.nodeInfo.scope = K.SCOPE_PROTOTYPE;
      }
      else if (this.docstring.hasTag('method')) {
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
    doc.id = (doc.receiver || '<<unknown>>') + doc.symbol + this.id;
  }

  doc.mixinTargets = doc.tags
    .filter(function(tag) { return tag.type === 'mixes'; })
    .map(function(tag) { return tag.typeInfo.name; })
  ;

  doc.superClasses = doc.tags
    .filter(function(tag) { return tag.type === 'extends'; })
    .map(function(tag) { return tag.typeInfo.name; })
  ;

  doc.aliases = Object.keys(this.docstring.aliases);

  return doc;
};

Doc.prototype.consumeDocstring = function(docstring) {
  this.docstring = docstring;
};

Doc.prototype.consumeNodeInfo = function(nodeInfo) {
  this.nodeInfo = nodeInfo;
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

Doc.prototype.getTypeDefs = function() {
  return this.docstring.typeDefs.map(typeDefData => {
    const typeDefDocstring = new Docstring(typeDefData);
    const [ typedReceiver, typedName ] = typeDefDocstring.name.split('~');

    typeDefDocstring.name = typedName;

    const doc = new Doc(typeDefDocstring, this.nodeInfo, this.filePath);

    doc.$isTypeDef = true;
    doc.receiver = typedReceiver;

    return doc;
  });
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