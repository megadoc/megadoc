const { stubConsoleWarn, stubConsoleError } = require('./watchConsole');
const sinon = require('sinon');
const R = require('ramda');

exports.sinonSuite = require('./SinonSuite');
exports.sinon = require('sinon');
exports.createSinonSuite = require('./SinonSuite');
exports.createFileSuite = require('./FileSuite');
exports.createIntegrationSuite = require('./createIntegrationSuite');
exports.assert = require('chai').assert;
exports.stubConsoleWarn = stubConsoleWarn;
exports.stubConsoleError = stubConsoleError;
exports.multiline = require('multiline-slash')
exports.uidOf = (id, nodes) => nodes.filter(x => x.id === id).map(x => x.uid)[0]

exports.stubLints = function(mochaSuite, Linter) {
  mochaSuite.beforeEach(function() {
    sinon.stub(Linter, 'for', () => Linter.NullLinter)
  })

  mochaSuite.afterEach(function() {
    Linter.for.restore()
  })
}

exports.createBuildersWithUIDs = function(corpusPackage) {
  const { builders, assignUID } = corpusPackage;

  return Object.keys(builders).reduce(function(map, name) {
    map[name] = R.pipe(builders[name], assignUID);
    return map;
  }, {})
}