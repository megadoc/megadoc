const mergeObject = require('./utils/mergeObject');

module.exports = function refine(compilation, done) {
  const { rawDocuments, processor } = compilation;
  const fn = require(processor.refineFnPath);
  const context = {
    compilerOptions: compilation.compilerOptions,
    options: compilation.processorOptions,
    sourcePatterns: compilation.sourcePatterns,
  };

  fn(context, rawDocuments, function(err, refinedDocuments) {
    if (err) {
      done(err);
    }
    else {
      done(null, mergeObject(compilation, { refinedDocuments: refinedDocuments }))
    }
  });
};