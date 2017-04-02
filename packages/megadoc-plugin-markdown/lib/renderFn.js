module.exports = function renderFn(context, operations, documentNode) {
  const { markdown, linkify } = operations;

  const doc = documentNode.properties;

  return {
    source: markdown(linkify({ text: doc.source, contextNode: documentNode }), {
      sanitize: context.options.sanitize !== false
    }),
  };
};
