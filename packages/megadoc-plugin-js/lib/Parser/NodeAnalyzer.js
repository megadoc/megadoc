var runAllSync = require('../utils/runAllSync');
var analyzeNode = require('./NodeAnalyzer/analyzeNode');
var t = require('babel-types');

var NodeAnalyzer = exports;

NodeAnalyzer.analyze = function(node, path, filePath, config) {
  var nodeInfo = analyzeNode(node, path, filePath, config);

  runAllSync(config.nodeAnalyzers || [], [ t, node, path, nodeInfo ]);

  return nodeInfo;
};