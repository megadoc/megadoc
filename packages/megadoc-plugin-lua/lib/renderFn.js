module.exports = function renderFn(options, operations, documentNode) {
  const { markdown, linkify } = operations;

  const doc = documentNode.properties;

  return {
    description: markdown({
      text: linkify({ text: doc.description, contextNode: documentNode }),
      contextNode: documentNode
    }),
    tags: doc.tags.map(tag => {
      return {
        description: markdown({
          text: linkify({ text: tag.description, contextNode: documentNode }),
          contextNode: documentNode
        })
      }
    })
  };
};
