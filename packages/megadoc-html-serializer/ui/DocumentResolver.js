const console = require("console");
const CorpusAPI = require('./CorpusAPI');
const invariant = require('invariant');
const LayoutEngine = require('./LayoutEngine');
const { assign } = require('lodash');

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
  const overriddenDocumentLink = LayoutEngine.getDocumentOverride(href, config);

  if (overriddenDocumentLink) {
    node = getByPathOrURI(corpus, overriddenDocumentLink);

    if (!node) {
      console.warn(
        "A document '%s' specified as an override for the url '%s' could " +
        "not be found. This is most likely a configuration error.",
        overriddenDocumentLink, href
      );
    }
  }

  if (!node) {
    node = corpus.getByURI(href);
  }

  if (node) {
    return buildDocumentContext(resolveRedirect(this, node));
  }
  else {
    // try to resolve index node
    const indexPathname = location.pathname + 'index';
    const indexHref = this.documentURI.withExtension(indexPathname) + location.hash;
    const indexNode = corpus.getByURI(indexHref);

    if (indexNode) {
      return buildDocumentContext(resolveRedirect(this, indexNode));
    }
    else {
      if (this.config.redirect && this.config.redirect[location.pathname]) {
        return this.resolveFromLocation(assign({}, location, {
          pathname: this.config.redirect[location.pathname]
        }));
      }
      else {
        console.warn("Unable to find a document at the URI '%s' (from '%s')", href, location.pathname);
        return null;
      }
    }
  }
};

DocumentResolver.prototype.getProtocolAgnosticPathName = function(location) {
  return this.documentURI.normalize(
    this.documentURI.withExtension(location.pathname)
  ) + location.hash;
};

function resolveRedirect(resolver, contextNode) {
  if (contextNode && contextNode.meta && contextNode.meta.redirect) {
    const targetNode = getByPathOrURI(resolver.corpus, contextNode.meta.redirect);

    if (targetNode) {
      return targetNode;
    }
    else {
      console.warn("Unable to find the redirect document target at '%s' (from '%s')", targetNode.meta.redirect, contextNode.uid);

      return null;
    }
  }
  else {
    return contextNode;
  }
}

function getByPathOrURI(corpus, link) {
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
    ctx.documentEntityNode = null;
    ctx.documentNode = node;
    ctx.namespaceNode = CorpusAPI.getNamespaceOfNode(node);
  }
  else if (node.type === 'Namespace') {
    ctx.documentEntityNode = null;
    ctx.documentNode = null;
    ctx.namespaceNode = node;
  }

  return ctx;
}

module.exports = DocumentResolver;
module.exports.buildDocumentContext = buildDocumentContext;