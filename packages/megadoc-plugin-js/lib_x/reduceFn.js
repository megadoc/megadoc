const b = require('megadoc-corpus').builders;

module.exports = function reduceFn(options, rawDocument, done) {
  if (rawDocument.isModule) {
    done(null, reduceModuleDocument(rawDocument));
  }
  else if (rawDocument.isNamespace) {
    done(null, reduceNamespaceDocument(rawDocument));
  }
  else {
    done(null, reduceEntityDocument(rawDocument));
  }
};

function reduceNamespaceDocument(doc) {
  return b.document({
    id: doc.id,
    title: doc.title,
    symbol: doc.symbol,
    indexFields: [ '$uid', '$filePath', 'name', 'aliases' ],
    filePath: doc.filePath, // useful for error reporting when there's a UID clash
    loc: doc.loc,
    properties: {
      isNamespace: true,
      tags: [],
    },
  });
}

function reduceModuleDocument(doc) {
  return b.document({
    id: doc.name,
    title: doc.id,
    summary: doc.description,
    filePath: doc.filePath,
    loc: doc.loc,
    symbol: '',
    properties: doc,
  });
}

function reduceEntityDocument(doc) {
  return b.documentEntity({
    id: doc.symbol + doc.name,
    title: doc.id,
    summary: doc.description,
    filePath: doc.filePath,
    loc: doc.loc,
    properties: doc,
  });
}
