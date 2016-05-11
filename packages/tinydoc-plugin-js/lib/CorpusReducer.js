var Corpus = require('tinydoc-corpus').Corpus;
var CorpusTypes = require('tinydoc-corpus').Types;
var b = CorpusTypes.builders;
var K = require('./Parser/constants');
var RendererUtils = require('tinydoc/lib/RendererUtils');

module.exports = function reduceDocuments(options) {
  var rawDocuments = options.documents;
  var documents = rawDocuments
    .filter(function(doc) { return doc.isModule; })
    .map(reduceModuleDocument)
  ;

  var namespaces = {};
  var bank = b.namespace({
    id: options.namespaceId,
    name: 'tinydoc-plugin-js',
    title: options.namespaceTitle,
    documents: [],
    config: options.config,
    indexFields: [ 'aliases' ],
    meta: {
      outlets: [
        {
          name: 'CJS::Module',
          options: {},
        },
        {
          name: 'CJS::ClassBrowser',
          options: {},
        }
      ],

      defaultLayouts: [
        {
          match: { by: 'type', on: 'Namespace' },
          regions: [
            {
              name: 'Layout::Sidebar',
              outlets: [{ name: 'CJS::ClassBrowser' }]
            }
          ]
        },
        {
          match: { by: 'type', on: [ 'Document', 'DocumentEntity' ] },
          regions: [
            {
              name: 'Layout::Content',
              options: { framed: true },
              outlets: [
                { name: 'CJS::ModuleHeader' },
                { name: 'CJS::ModuleIndex' },
                { name: 'CJS::ModuleBody' },
                { name: 'Layout::Content' },
              ]
            },
            {
              name: 'Layout::Sidebar',
              outlets: [{ name: 'CJS::ClassBrowser' }]
            }
          ]
        }
      ]
    }
  });

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
      title: doc.path,
      summary: generateSummary(doc),
      filePath: doc.absoluteFilePath,
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

  function reduceEntityDocument(parentDoc, doc) {
    return b.documentEntity({
      id: doc.ctx.symbol + doc.name,
      title: doc.path,
      summary: generateSummary(doc),
      filePath: doc.absoluteFilePath,
      properties: doc,
    });
  }

  return bank;
};

function generateSummary(doc) {
  if (doc.description) {
    return RendererUtils.extractSummary(doc.description, {
      plainText: true
    });
  }
}