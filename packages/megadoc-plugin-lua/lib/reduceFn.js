const b = require('megadoc-corpus').builders;

module.exports = function reduceFn(options, actions, rawDocument, done) {
  if (!rawDocument.id) {
    return done(null, null);
  }
  else if (!rawDocument.receiver) {
    return done(null, reduceModuleDocument(actions, rawDocument));
  }
  else {
    return done(null, reduceEntityDocument(actions, rawDocument));
  }
};

function reduceModuleDocument(actions, doc) {
  return b.document({
    id: doc.id,
    title: doc.id,
    filePath: doc.filePath,
    summary: actions.extractSummaryFromMarkdown(doc.description),
    properties: doc,
    symbol: '',
    entities: []
  });
}

function reduceEntityDocument(actions, doc) {
  return b.documentEntity({
    id: (doc.symbol || '') + doc.id,
    title: doc.path,
    summary: actions.extractSummaryFromMarkdown(doc.description),
    properties: doc
  })
}