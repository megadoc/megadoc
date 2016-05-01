var CorpusTypes = require('tinydoc-corpus').Types;
var b = CorpusTypes.builders;
var K = require('./Parser/constants');

module.exports = function reduceDocuments(options) {
  var rawDocuments = options.documents;
  var documents = rawDocuments
    .filter(function(doc) { return doc.isModule; })
    .map(reduceModuleDocument)
  ;

  var namespaces = {};
  var database = b.namespace({
    id: options.namespaceId,
    corpusContext: options.namespaceTitle,
    documents: [],
  });

  documents.forEach(function(x) {
    var nsId = x.properties.namespace;
    var nsNode;

    if (nsId) {
      nsNode = namespaces[nsId];

      if (!nsNode) {
        nsNode = namespaces[nsId] = b.document({
          id: nsId,
          symbol: K.NAMESPACE_SEP,
          documents: [],
          parentNode: database
        });

        database.documents.push(nsNode)
      }

      x.parentNode = nsNode;
      nsNode.documents.push(x);
    }
    else {
      x.parentNode = database;
      database.documents.push(x);
    }
  });

  function reduceModuleDocument(doc) {
    return b.document({
      id: doc.name,
      href: URI(doc),
      title: doc.path,
      filePath: doc.absoluteFilePath,
      properties: doc,
      documents: rawDocuments.filter(function(x) {
        return x.isModule && x.receiver === doc.id;
      }).map(reduceModuleDocument),
      entities: rawDocuments.filter(function(x) {
        return !x.isModule && x.receiver === doc.id;
      }).map(reduceEntityDocument)
    });
  }

  function reduceEntityDocument(doc) {
    return b.documentEntity({
      id: doc.ctx.symbol + doc.name,
      href: URI(doc),
      title: doc.path,
      filePath: doc.absoluteFilePath,
      properties: doc,
    });
  }

  function URI(doc) {
    return doc.isModule ?
      ensureLeadingSlash(options.baseURL) + '/modules/' + encodeURIComponent(doc.id) :
      ensureLeadingSlash(options.baseURL) + '/modules/' + encodeURIComponent(doc.receiver) + '/' + encodeURIComponent(doc.ctx.symbol + doc.name)
    ;
  }

  return database;
};

function ensureLeadingSlash(s) {
  return s[0] === '/' ? s : '/' + s;
}