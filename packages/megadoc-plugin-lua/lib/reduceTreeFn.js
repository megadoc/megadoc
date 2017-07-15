module.exports = function reduceTreeFn(context, documents) {
  return [{
    type: 'SET_NAMESPACE_ATTRIBUTES',
    data: {
      title: context.options.title
    }
  }].concat(
    documents.filter(x => x.properties.receiver).map(function(document) {
      return {
        type: 'CHANGE_NODE_PARENT',
        data: {
          id: document.id,
          parentId: document.properties.receiver,
        }
      }
    })
  );
};
