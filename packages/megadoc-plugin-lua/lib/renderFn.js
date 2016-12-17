module.exports = function renderFn(options, operations, documentNode) {
  const { markdown, linkify } = operations;

  const doc = documentNode.properties;

  return {
    description: markdown(linkify({ text: doc.description, contextNode: documentNode })),
    tags: doc.tags.map(tag => {
      return {
        description: markdown(linkify({ text: tag.description, contextNode: documentNode }))
      }
    })
  };
};
