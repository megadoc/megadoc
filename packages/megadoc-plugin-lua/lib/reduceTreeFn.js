module.exports = function reduceTreeFn(options, documents) {
  return documents.filter(x => x.properties.receiver).map(function(document) {
    return {
      type: 'CHANGE_NODE_PARENT',
      data: {
        id: document.id,
        parentId: document.properties.receiver,
      }
    }
  });
};
