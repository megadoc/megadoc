const { builders: b } = require('megadoc-corpus');
const { extractTOC } = require('megadoc-markdown-utils');
const { omit } = require('lodash');

module.exports = function reduceFn(options, rawDocument, done) {
  const toc = extractTOC(rawDocument.source);

  return done(null, b.document({
    id: rawDocument.id,
    title: rawDocument.plainTitle,
    filePath: rawDocument.filePath,
    summary: rawDocument.summary,
    properties: omit(rawDocument, ['filePath']),
    symbol: '#',
    entities: toc.map(function(section) {
      return b.documentEntity({
        id: section.scopedId,
        title: section.text,
        properties: section,
        indexFields: section.level === 1 ? [] : undefined,
        filePath: rawDocument.filePath,
        meta: {
          indexDisplayName: Array(section.level * 2).join(' ') + section.text,
          anchor: section.scopedId
        }
      })
    }),
    documents: null,
  }))
};
