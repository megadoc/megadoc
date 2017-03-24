const mergeObject = require('./utils/mergeObject');

module.exports = function refine(compilation, done) {
  const { documents, processor } = compilation;

  if (processor.refineFnPath) {
    const fn = require(processor.refineFnPath);
    const context = {
      commonOptions: compilation.commonOptions,
      options: compilation.processorOptions,
      state: compilation.processorState,
    };

    fn(context, documents, function(err, refinedDocuments) {
      if (err) {
        done(err);
      }
      else {
        done(null, mergeObject(compilation, { refinedDocuments: refinedDocuments }))
      }
    });
  }
  else {
    done(null, mergeObject(compilation, { refinedDocuments: documents }));
  }
};