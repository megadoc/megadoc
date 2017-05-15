const b = require('megadoc-corpus').builders;

module.exports = function reduceFn(options, actions, rawDocument, done) {
  if (rawDocument.isModule) {
    done(null, reduceModuleDocument(actions, rawDocument));
  }
  else if (rawDocument.isNamespace) {
    done(null, reduceNamespaceDocument(actions, rawDocument));
  }
  else {
    done(null, reduceEntityDocument(actions, rawDocument));
  }
};

function reduceNamespaceDocument(actions, doc) {
  return b.document({
    id: doc.id,
    title: doc.title,
    symbol: '.',
    indexFields: [ '$uid', '$filePath', 'name', 'aliases' ],
    filePath: doc.filePath, // useful for error reporting when there's a UID clash
    loc: doc.loc,
    properties: {
      isNamespace: true,
      tags: [],
    },
  });
}

function reduceModuleDocument(actions, doc) {
  return b.document({
    id: doc.name,
    title: doc.id,
    summary: actions.extractSummaryFromMarkdown(doc.description),
    filePath: doc.filePath,
    loc: doc.loc,
    symbol: '',
    properties: doc,
  });
}

function reduceEntityDocument(actions, doc) {
  return b.documentEntity({
    id: doc.id,
    title: doc.id,
    summary: actions.extractSummaryFromMarkdown(doc.description),
    meta: {
      anchor: encodeURI((doc.symbol + doc.name).replace(/[\/\s]+/g, '-'))
    },
    filePath: doc.filePath,
    loc: doc.loc,
    properties: doc,
    indices: {
      [doc.symbol + doc.name]: 0
    },
    indexFields: [
      '$uid',
      'id',
      'aliases',
    ],
  });
}
