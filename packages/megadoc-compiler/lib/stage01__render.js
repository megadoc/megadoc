const mergeObject = require('./utils/mergeObject');

module.exports = function render(renderRoutines, compilation, done) {
  const { documents, processor, options } = compilation;

  let renderOperations = {};

  if (processor.renderFnPath) {
    const fn = require(processor.renderFnPath);

    renderOperations = documents.reduce(function(map, document) {
      const documentRenderingDescriptor = fn(options, renderRoutines, document);

      if (documentRenderingDescriptor) {
        map[document.id] = documentRenderingDescriptor;
      }

      return map;
    }, {})
  }

  done(null, mergeObject(compilation, { renderOperations: renderOperations }));
};
