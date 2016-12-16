module.exports = function reduceTreeFn(options, documents) {
  const entityDocuments = documents.filter(x => x.properties.receiver);
  const parentIdMap = documents.filter(x => !x.properties.receiver).reduce(function(map, document) {
    map[document.id] = document.uid;
    return map;
  }, {});

  return entityDocuments.map(function(document) {
    return {
      type: 'CHANGE_NODE_PARENT',
      data: {
        uid: document.uid,
        parentUid: parentIdMap[document.properties.receiver],
      }
    }
  });
};
