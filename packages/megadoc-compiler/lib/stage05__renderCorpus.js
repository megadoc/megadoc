const async = require('async');
const TreeRenderer = require('./TreeRenderer');
const mergeObject = require('./utils/mergeObject');
const partial = require('./utils/partial');

module.exports = function renderTrees(config, withTrees, callback) {
  async.map(withTrees, partial(renderTree, config), callback);
};

function renderTree(config, compilation, done) {
  const { options, tree, renderOperations } = compilation;

  done(null, mergeObject(compilation, {
    renderedTree: TreeRenderer.renderTree(options, tree, renderOperations)
  }))
};
