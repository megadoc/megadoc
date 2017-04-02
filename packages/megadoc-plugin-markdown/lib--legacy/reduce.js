var b = require('megadoc-corpus').Types.builders;

function reduce(compiler, config, documents) {
  var nodes = documents.map(reduceDocument);

  return b.namespace({
    id: config.id,
    name: 'megadoc-plugin-markdown',
    title: config.title,
    config: config,
    meta: {
      // TODO: stop switching against null in CorpusVisitor - it's stupid
      href: config.baseURL !== undefined ? config.baseURL : undefined,
      defaultLayouts: require('./defaultLayouts'),
    },

    documents: nodes
  });

  function reduceDocument(doc) {
    // omg omg, we're rendering everything twice now
    var compiled = compiler.renderer.withTOC(doc.source);

    // TODO: b.markdownDocument
    return b.document({
      id: doc.id,
      symbol: '#',
      title: doc.plainTitle,
      summary: doc.summary,
      filePath: doc.filePath,
      properties: doc,
      entities: compiled.toc.map(function(section) {
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
      })
    })
  }
}

module.exports = reduce;