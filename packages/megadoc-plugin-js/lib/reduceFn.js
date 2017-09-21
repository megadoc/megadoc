const b = require('megadoc-corpus').builders;
const debugLog = function() {
  if (process.env.MEGADOC_DEBUG === '1') {
    console.log.apply(console, arguments)
  }
}

module.exports = function reduceFn(options, actions, rawDocument, done) {
  debugLog('Reducing "%s"', rawDocument.id)

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
    filePath: doc.filePath,
    loc: doc.loc,
    properties: {
      isNamespace: true,
      tags: [],
    },
  });
}

function reduceModuleDocument(actions, doc) {
  return b.document({
    id: doc.namespace ? doc.name : doc.id,
    title: doc.id,
    summary: actions.extractSummaryFromMarkdown(doc.description),
    filePath: doc.filePath,
    loc: doc.loc,
    symbol: '',
    properties: doc,
  });
}

function reduceEntityDocument(actions, doc) {
  const id = doc.symbol + doc.name;

  return b.documentEntity({
    id: id,
    title: doc.id,
    summary: actions.extractSummaryFromMarkdown(doc.description),
    meta: {
      anchor: encodeURI(id.replace(/[\/\s]+/g, '-'))
    },
    filePath: doc.filePath,
    loc: doc.loc,
    properties: doc,
    indices: {
      [id]: 0
    },
    indexFields: [
      '$uid',
      'id',
      'aliases',
    ],
  });
}
