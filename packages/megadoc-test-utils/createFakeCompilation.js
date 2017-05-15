const compiler = require('megadoc-compiler');
const { run: compile } = compiler;

const {
  STATE_PARSED,
  STATE_REDUCED,
  STATE_REFINED,
  STATE_RENDERED,
  STATE_TREE_REDUCED,
  STATE_TREE_MERGED,
  STATE_CORPUS_RENDERED,
  STATE_EMITTED,
} = compiler;

module.exports = function createFakeCompilation({ state, config }, done) {

};