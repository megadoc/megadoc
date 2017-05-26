const b = require('megadoc-corpus').builders;
const { extractTOC } = require('megadoc-html-serializer').RendererUtils;

module.exports = function reduceFn(options, actions, rawDocument, done) {
  const toc = extractTOC(rawDocument.source);

  return done(null, b.document({
    id: rawDocument.id,
    title: rawDocument.plainTitle,
    filePath: rawDocument.filePath,
    summary: rawDocument.summary,
    properties: rawDocument,
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
