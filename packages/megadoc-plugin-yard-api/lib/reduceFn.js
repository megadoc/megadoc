const b = require('megadoc-corpus').builders;
const listOf = x => Array.isArray(x) ? x : [].concat(x || [])

module.exports = (options, rawDocument, done) => {
  const firstDefSource = rawDocument.endpoints.reduce(function(x, endpoint) {
    return x || (endpoint.files.length ? endpoint.files[0] : null);
  }, null)

  const filePath = firstDefSource ? firstDefSource[0] : undefined
  const loc = firstDefSource ? { start: { line: firstDefSource[1] } } : undefined
  const endpointDocuments = listOf(rawDocument.endpoints).map(reduceEndpointDocument)
  const objectDocuments = listOf(rawDocument.objects).map(reduceObjectDocument).map(x => {
    if (!x.filePath) {
      x.filePath = filePath
    }

    if (!x.loc) {
      x.loc = loc
    }

    return x
  })

  done(null, b.document({
    id: rawDocument.id,
    title: rawDocument.title,
    summaryFields: getSummaryFields(rawDocument),
    properties: rawDocument,
    filePath,
    loc,
    entities: objectDocuments.concat(endpointDocuments)
  }))
}

function reduceObjectDocument(rawDocument) {
  return b.documentEntity({
    id: rawDocument.scoped_id,
    title: rawDocument.title,
    summaryFields: getSummaryFields(rawDocument),
    meta: {
      entityType: 'api-object',
      indexDisplayName: rawDocument.title + ' (Object)',
    },
    properties: rawDocument
  });
}

function reduceEndpointDocument(rawDocument) {
  const [ file ] = rawDocument.files

  return b.documentEntity({
    id: rawDocument.scoped_id,
    title: rawDocument.title,
    summaryFields: getSummaryFields(rawDocument),
    filePath: file[0],
    loc: { start: { line: file[1] } },
    meta: {
      entityType: 'api-endpoint',
      indexDisplayName: rawDocument.title + ' (Endpoint)',
    },
    properties: rawDocument
  });
}

function getSummaryFields(doc) {
  return [
    typeof doc.text === 'object' ? 'text.description' : 'text'
  ];
}