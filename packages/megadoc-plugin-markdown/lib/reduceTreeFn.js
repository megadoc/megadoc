module.exports = function reduceTree(context/*, documents*/) {
  const descriptors = [];

  descriptors.push({
    type: 'SET_NAMESPACE_ATTRIBUTES',
    data: {
      name: 'megadoc-plugin-markdown',
      title: context.options.title,
      config: context.options, // omit parserConfig or what?
      indexFields: [ '$uid', '$filePath' ],
      meta: {
        href: context.options.baseURL
      }
    }
  });

  return descriptors;
}