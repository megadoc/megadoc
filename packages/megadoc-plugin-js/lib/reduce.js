var Corpus = require('megadoc-corpus').Corpus;
var CorpusTypes = require('megadoc-corpus').Types;
var b = CorpusTypes.builders;
var K = require('./Parser/constants');
var RendererUtils = require('megadoc/lib/RendererUtils');

module.exports = function reduceDocuments(options) {
  var rawDocuments = options.documents;
  var bank = b.namespace({
    id: options.namespaceId,
    name: 'megadoc-plugin-js',
    title: options.namespaceTitle,
    documents: [],
    config: options.config,
    indexFields: [ '$uid', '$filePath', 'aliases' ],
    meta: {
      href: options.baseURL,
      defaultLayouts: require('./defaultLayouts')
    }
  });

  var documents = rawDocuments
    .filter(function(doc) { return doc.isModule; })
    .map(reduceModuleDocument)
  ;

  // So, the initial set of "namespaces" are all the module docs that contain
  // other module docs (implicit namespaces). The rest of the namespaces (ones
  // that are identified by the @namespace tag) we'll create afterwards.
  //
  // Note that we must do these two in separate passes because we do not want
  // to "overwrite" those docs! See below to know what I mean.
  var namespaces = documents.reduce(function(map, x) {
    if (x.properties && x.properties.isModule && !x.properties.namespace) {
      map[x.properties.id] = x;
    }

    return map;
  }, {});

  documents.forEach(function(x) {
    var namespaceId = x.properties.namespace;
    var namespace;

    if (namespaceId) {
      namespace = namespaces[namespaceId];

      if (!namespace) {
        namespace = namespaces[namespaceId] = b.document({
          id: namespaceId,
          title: namespaceId,
          symbol: K.NAMESPACE_SEP,
          filePath: x.filePath, // useful for error reporting when there's a UID clash
          loc: x.loc,
          documents: [],
          entities: [],
          meta: {}
        });

        Corpus.attachNode('documents', bank, namespace);
      }
    }

    Corpus.attachNode('documents', namespace || bank, x);
  });

  function reduceModuleDocument(doc) {
    return b.document({
      id: doc.name,
      title: doc.id,
      summary: generateSummary(doc),
      filePath: doc.filePath,
      loc: doc.loc,
      symbol: '',
      properties: doc,
      documents: rawDocuments.filter(function(x) {
        return x.isModule && x.receiver === doc.id;
      }).map(reduceModuleDocument),
      entities: rawDocuments.filter(function(x) {
        return !x.isModule && x.receiver === doc.id;
      }).map(reduceEntityDocument.bind(null, doc))
    });
  }

  return bank;
};

function reduceEntityDocument(parentDoc, doc) {
  return b.documentEntity({
    id: doc.symbol + doc.name,
    title: doc.id,
    summary: generateSummary(doc),
    filePath: doc.filePath,
    loc: doc.loc,
    properties: doc,
  });
}

function generateSummary(doc) {
  if (doc.description) {
    return RendererUtils.extractSummary(doc.description, {
      plainText: true
    });
  }
}