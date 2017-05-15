const mergeObject = require('./utils/mergeObject');

// TODO: distribute
module.exports = function render(renderRoutines, compilation, done) {
  const { documents, processor } = compilation;
  const context = {
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
    state: compilation.processorState,
  };

  let renderOperations = {};

  if (processor.renderFnPath) {
    const fn = require(processor.renderFnPath);

    renderOperations = documents.reduce(function(map, document) {
      const documentRenderingDescriptor = fn(context, renderRoutines, document);

      if (documentRenderingDescriptor) {
        map[document.id] = documentRenderingDescriptor;
      }

      return map;
    }, {})
  }

  done(null, mergeObject(compilation, { renderOperations: renderOperations }));
};
