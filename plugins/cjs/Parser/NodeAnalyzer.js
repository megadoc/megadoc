var runAllSync = require('../../../lib/utils/runAllSync');
var analyzeNode = require('./NodeAnalyzer/analyzeNode');
var n = require('recast').types.namedTypes;

var NodeAnalyzer = exports;

NodeAnalyzer.analyze = function(node, path, filePath, config) {
  var nodeInfo = analyzeNode(node, path, filePath, config);

  runAllSync(config.nodeAnalyzers, [ n, node, path, nodeInfo ]);

  return nodeInfo;
};