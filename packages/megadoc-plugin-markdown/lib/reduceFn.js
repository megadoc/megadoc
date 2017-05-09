const b = require('megadoc-corpus').builders;
const { extractTOC } = require('megadoc-html-serializer').RendererUtils;

module.exports = function reduceFn(options, rawDocument, done) {
  const toc = extractTOC(rawDocument.source);
  if (!rawDocument.id) {
    console.warn('doc has no id?', rawDocument)
  }

  return done(null, b.document({
    id: rawDocument.id,
    title: rawDocument.plainTitle,
    filePath: rawDocument.filePath,
    summary: rawDocument.summary,
    properties: Object.assign({}, rawDocument, {
      // plainTitle: rawDocument.title
    }),
    symbol: '#',
    entities: toc.map(function(section) {
      return b.documentEntity({
        id: section.scopedId,
        title: section.text,
        properties: section,
        indexFields: section.level === 1 ? [] : undefined,
        meta: {
          indexDisplayName: Array(section.level * 2).join(' ') + section.text,
          anchor: section.scopedId
        }
      })
    }),
    documents: null,
  }))
};
