module.exports = function initState(compilation, done) {
  const fnPath = compilation.processor.initFnPath;

  if (!fnPath) {
    done(null, compilation);
  }
  else {
    const fn = require(fnPath);
    const state = fn({
      options: compilation.processorOptions,
    });

    done(null, Object.assign({}, compilation, { processorState: state }))
  }
}