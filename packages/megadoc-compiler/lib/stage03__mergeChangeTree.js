const mergeObject = require('./utils/mergeObject');
const mergeTrees = require('./mergeTrees');

module.exports = function mergeChangeTree(prevState, compilation, done) {
  if (!prevState) {
    return done(null, compilation);
  }

  const [ prevCompilation ] = prevState.compilations.filter(x => x.id === compilation.id);
  const mergedCompilation = mergeTrees(prevCompilation, compilation);

  done(null, mergeObject(compilation, mergedCompilation));
};
