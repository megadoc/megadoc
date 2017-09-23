const { omit } = require('lodash');

module.exports = function reduceTree(context, documents) {
  const descriptors = [];

  descriptors.push({
    type: 'SET_NAMESPACE_ATTRIBUTES',
    data: {
      name: 'megadoc-plugin-js',
      title: context.options.title,
      config: omit(context.options, [ 'parserConfig' ]), // omit parserConfig or what?
      indexFields: [ '$uid', '$filePath', 'aliases' ],
      meta: {
        href: context.options.baseURL || undefined
      }
    }
  });

  documents.filter(x => x.type === 'DocumentEntity').forEach(function(x) {
    descriptors.push({
      type: 'CHANGE_NODE_PARENT',
      data: {
        uid: x.uid,
        parentUid: documents.filter(y => y.properties.id === x.properties.receiver).map(y => y.uid)[0],
      }
    });
  });

  documents.filter(x => x.properties.namespace).forEach(function(x) {
    descriptors.push({
      type: 'CHANGE_NODE_PARENT',
      data: {
        uid: x.uid,
        parentUid: documents.filter(y => y.id === x.properties.namespace).map(y => y.uid)[0]
      }
    });
  });

  return descriptors;
}