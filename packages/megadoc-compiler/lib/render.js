const mergeObject = require('./utils/mergeObject');

// TODO: distribute
module.exports = function render(renderRoutines, compilation, done) {
  const { documents, processor } = compilation;
  const fn = require(processor.renderFnPath);
  const context = {
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
  };

  const renderOperations = documents.reduce(function(map, document) {
    const documentRenderingDescriptor = fn(context, renderRoutines, document);

    if (Array.isArray(documentRenderingDescriptor)) {
      documentRenderingDescriptor.forEach(([ uid, descriptor ]) => {
        map[uid] = descriptor
      })
    }
    else if (documentRenderingDescriptor) {
      map[document.uid] = documentRenderingDescriptor;
    }

    return map;
  }, {})

  done(null, mergeObject(compilation, { renderOperations: renderOperations }));
};
