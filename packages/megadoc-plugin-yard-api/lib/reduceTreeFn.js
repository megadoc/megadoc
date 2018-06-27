module.exports = function reduceTree(context/*, documents*/) {
  const descriptors = [];

  descriptors.push({
    type: 'SET_NAMESPACE_ATTRIBUTES',
    data: {
      name: 'megadoc-plugin-yard-api',
      title: context.options.title,
      config: {},
      indexFields: [ 'title', 'shorthandTitle' ],
      meta: {
        href: context.options.url || undefined
      }
    }
  });

  return descriptors;
}