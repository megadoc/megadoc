const DocumentURI = require('core/DocumentURI');
const CorpusAPI = require('core/CorpusAPI');
const invariant = require('utils/invariant');
const LayoutEngine = require('./LayoutEngine');

function DocumentResolver(corpus) {
  var exports = {};

  exports.resolveFromLocation = function(location, config) {
    let documentNode;

    invariant(typeof location.pathname === 'string',
      "Location @pathname must be present.");

    invariant(typeof location.origin === 'string',
      "Location @origin must be present.");

    invariant(typeof location.protocol === 'string',
      "Location @protocol must be present.");

    invariant(typeof location.hash === 'string',
      "Location @hash must be present.");


    const href = getProtocolAgnosticPathName(location);

    if (config && config.layoutOptions) {
      const overriddenDocumentLink = LayoutEngine.getDocumentOverride(href, config.layoutOptions);

      if (overriddenDocumentLink) {
        documentNode = getByUIDOrURI(corpus, overriddenDocumentLink);

        if (!documentNode) {
          console.warn(
            "A document '%s' specified as an override for the url '%s' could " +
            "not be found. This is most likely a configuration error.",
            overriddenDocumentLink, href
          );
        }
      }
    }

    if (!documentNode) {
      documentNode = corpus.getByURI(href);
    }

    if (documentNode) {
      return buildDocumentContext(documentNode);
    }
    else {
      console.warn("Unable to find a document at the URI '%s' (from '%s')", href, location.pathname);
    }
  };

  return exports;
}

function getProtocolAgnosticPathName(location) {
  return DocumentURI(DocumentURI.withExtension(location.pathname)) + location.hash;
}

function getByUIDOrURI(corpus, link) {
  return corpus.get(link) || corpus.getByURI(link);
}

function buildDocumentContext(documentNode) {
  return {
    documentNode: documentNode.type === 'DocumentEntity' ? documentNode.parentNode : documentNode,
    documentEntityNode: documentNode.type === 'DocumentEntity' ? documentNode : undefined,
    namespaceNode: CorpusAPI.getNamespaceOfNode(documentNode)
  };
}

module.exports = DocumentResolver;
module.exports.getProtocolAgnosticPathName = getProtocolAgnosticPathName;
module.exports.buildDocumentContext = buildDocumentContext;