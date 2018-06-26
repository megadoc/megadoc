require('react-drill/lib/dependencies/ReactTestUtils')(require('react-addons-test-utils'))
require('react-drill/addons/cheerio').activate()

const { stubConsoleWarn, stubConsoleError } = require('./watchConsole');
const { drill, m } = require('react-drill');
const sinon = require('sinon');
const R = require('ramda');
const RE_SURROUNDING_NEWLINES = /^\n+|\n\s*$/g;

exports.$ = require('cheerio')
exports.drill = drill;
exports.m = m;
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

exports.neutralizeWhitespace = function(src) {
  const lines = src.split('\n')
  const notBlank = x => /\S/.test(x);
  const firstFilledLine = R.find(notBlank, lines);

  if (!firstFilledLine) {
    return src;
  }

  const indentSize = firstFilledLine.match(/\S/).index;
  const indent = Array(indentSize).fill(' ').join('');
  const startsWithIndent = R.startsWith(indent);

  if (!lines.filter(notBlank).every(startsWithIndent)) {
    return src;
  }

  return src
    .replace(new RegExp(`(^|\n)[ ]{${indentSize}}`, 'g'), '$1')
    .replace(RE_SURROUNDING_NEWLINES, '')
  ;
};
