var analyzeNode = require('./NodeAnalyzer/analyzeNode');
var n = require('recast').types.namedTypes;

var NodeAnalyzer = exports;

NodeAnalyzer.analyze = function(node, path, filePath, config) {
  var nodeInfo = analyzeNode(node, path, filePath, config);

  if (config.analyzeNode) {
    config.analyzeNode(n, node, path, nodeInfo);
  }

  return nodeInfo;
};