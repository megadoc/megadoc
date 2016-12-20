const CorpusAPI = require('core/CorpusAPI');
const invariant = require('utils/invariant');
const LayoutEngine = require('./LayoutEngine');

function DocumentResolver({ config, corpus, documentURI }) {
  this.corpus = corpus;
  this.config = config;
  this.documentURI = documentURI;
}

DocumentResolver.prototype.resolveFromLocation = function(location) {
  const { config, corpus } = this;
  let node;

  invariant(typeof location.pathname === 'string',
    "Location @pathname must be present.");

  invariant(typeof location.origin === 'string',
    "Location @origin must be present.");

  invariant(typeof location.protocol === 'string',
    "Location @protocol must be present.");

  invariant(typeof location.hash === 'string',
    "Location @hash must be present.");


  const href = this.getProtocolAgnosticPathName(location);

  if (config && config.layoutOptions) {
    const overriddenDocumentLink = LayoutEngine.getDocumentOverride(href, config.layoutOptions);

    if (overriddenDocumentLink) {
      node = getByUIDOrURI(corpus, overriddenDocumentLink);

      if (!node) {
        console.warn(
          "A document '%s' specified as an override for the url '%s' could " +
          "not be found. This is most likely a configuration error.",
          overriddenDocumentLink, href
        );
      }
    }
  }

  if (!node) {
    node = corpus.getByURI(href);
  }

  if (node) {
    return buildDocumentContext(node);
  }
  else {
    console.warn("Unable to find a document at the URI '%s' (from '%s')", href, location.pathname);
    console.log('>> CORPUS HAS %d DOCUMENTS <<', corpus.length)
  }
};

DocumentResolver.prototype.getProtocolAgnosticPathName = function(location) {
  return this.documentURI.normalize(
    this.documentURI.withExtension(location.pathname)
  ) + location.hash;
}

function getByUIDOrURI(corpus, link) {
  return corpus.get(link) || corpus.getByURI(link);
}

function buildDocumentContext(node) {
  const ctx = {};

  if (node.type === 'DocumentEntity') {
    ctx.documentEntityNode = node;
    ctx.documentNode = node.parentNode;
    ctx.namespaceNode = CorpusAPI.getNamespaceOfNode(node);
  }
  else if (node.type === 'Document') {
    ctx.documentNode = node;
    ctx.namespaceNode = CorpusAPI.getNamespaceOfNode(node);
  }
  else if (node.type === 'Namespace') {
    ctx.namespaceNode = node;
  }

  return ctx;
}

module.exports = DocumentResolver;
module.exports.buildDocumentContext = buildDocumentContext;