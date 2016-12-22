module.exports = function reduceTree(context, documents) {
  const descriptors = [];

  descriptors.push({
    type: 'SET_NAMESPACE_ATTRIBUTES',
    data: {
      name: 'megadoc-plugin-js',
      title: context.options.title,
      config: context.options, // omit parserConfig or what?
      indexFields: [ '$uid', '$filePath', 'aliases' ],
      meta: {
        href: context.options.baseURL
      }
    }
  });

  const documentTitleMap = documents.reduce(function(map, document) {
    if (document.type !== 'DocumentEntity') {
      map[document.title] = document.id;
    }

    return map;
  }, {});

  documents.filter(x => x.type === 'DocumentEntity').forEach(function(x) {
    descriptors.push({
      type: 'CHANGE_NODE_PARENT',
      data: {
        id: x.id,
        parentId: documentTitleMap[x.properties.receiver]
      }
    });
  });

  documents.filter(x => x.properties.namespace).forEach(function(x) {
    descriptors.push({
      type: 'CHANGE_NODE_PARENT',
      data: {
        id: x.id,
        parentId: x.properties.namespace
      }
    });
  });

  return descriptors;
}