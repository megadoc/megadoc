const b = require('megadoc-corpus').builders;
const { omit } = require('lodash');
const debugLog = function() {
  if (process.env.MEGADOC_DEBUG === '1') {
    console.log.apply(console, arguments)
  }
}

module.exports = function reduceFn(options, rawDocument, done) {
  debugLog('Reducing "%s"', rawDocument.id)

  if (rawDocument.isNamespace) {
    done(null, reduceNamespaceDocument(rawDocument));
  }
  else if (rawDocument.isModule) {
    done(null, reduceModuleDocument(rawDocument));
  }
  else {
    done(null, reduceEntityDocument(rawDocument));
  }
};

function reduceNamespaceDocument(doc) {
  return b.document({
    id: doc.id,
    title: doc.id,
    symbol: '.',
    indexFields: [ '$uid', '$filePath', 'name', 'aliases' ],
    filePath: doc.filePath,
    loc: doc.loc,
    properties: omit(doc, [ 'filePath' ]),
  });
}

function reduceModuleDocument(doc) {
  return b.document({
    id: doc.namespace ? doc.name : doc.id,
    title: doc.id,
    summaryFields: [ 'description' ],
    filePath: doc.filePath,
    loc: doc.loc,
    symbol: '',
    properties: omit(doc, [ 'filePath' ]),
  });
}

function reduceEntityDocument(doc) {
  const id = doc.symbol + doc.name;

  return b.documentEntity({
    id: id,
    title: doc.id,
    summaryFields: [ 'description' ],
    filePath: doc.filePath,
    loc: doc.loc,
    properties: omit(doc, [ 'filePath' ]),
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
