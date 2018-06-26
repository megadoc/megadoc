const { builders: b } = require('megadoc-corpus');
const { omit } = require('lodash');

module.exports = function reduceFn(options, rawDocument, done) {
  return done(null, b.document({
    id: rawDocument.id,
    title: rawDocument.title,
    filePath: rawDocument.filePath,
    summary: rawDocument.summary,
    properties: omit(rawDocument, [ 'anchor', 'filePath', 'title', 'headings', 'summary' ]),
    symbol: '#',
    meta: {
      anchor: rawDocument.anchor,
    },
    entities: rawDocument.headings.map(function(heading) {
      return b.documentEntity({
        id: heading.scopedId,
        title: heading.text,
        properties: heading,
        indexFields: heading.level === 1 ? [] : undefined,
        filePath: rawDocument.filePath,
        meta: {
          indexDisplayName: Array(heading.level * 2).join(' ') + heading.text,
          anchor: heading.scopedId
        }
      })
    }),
    documents: null,
  }))
};
