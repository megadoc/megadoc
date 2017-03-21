const mergeObject = require('./utils/mergeObject');
const TreeComposer = require('./TreeComposer');

module.exports = function mergeChangeTree(prevState, compilation, done) {
  if (!prevState) {
    return done(null, compilation);
  }

  const [ prevCompilation ] = prevState.compilations.filter(x => x.id === compilation.id);
  const mergedCompilation = TreeComposer.mergeTrees(prevCompilation, compilation);

  done(null, mergeObject(compilation, mergedCompilation));
};
