var TestUtils = require('jsdoc-parser-extended/lib/TestUtils');
var nodeAnalyzer = require('./nodeAnalyzer');
var correctifyFunctionScopes = require('./postProcessors/correctifyFunctionScopes');

exports.parse = function(strGenerator) {
  return TestUtils.parseInline(strGenerator, {
  }, null, function(parser) {
    parser.emitter.on('process-node', nodeAnalyzer);
    parser.emitter.on('postprocess', correctifyFunctionScopes)
  });
};