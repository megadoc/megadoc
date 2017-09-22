const b = require('megadoc-corpus').builders;

module.exports = function reduceFn(options, rawDocument, done) {
  if (!rawDocument.id) {
    return done(null, null);
  }
  else if (!rawDocument.receiver) {
    return done(null, reduceModuleDocument(rawDocument));
  }
  else {
    return done(null, reduceEntityDocument(rawDocument));
  }
};

function reduceModuleDocument(doc) {
  return b.document({
    id: doc.id,
    title: doc.id,
    filePath: doc.filePath,
    summaryFields: [ 'description' ],
    properties: doc,
    symbol: '',
    entities: []
  });
}

function reduceEntityDocument(doc) {
  return b.documentEntity({
    id: (doc.symbol || '') + doc.id,
    title: doc.path,
    summaryFields: [ 'description' ],
    properties: doc
  })
}