var render = require('../render');
var assert = require('chai').assert;
var TestUtils = require('../Parser/TestUtils');
var reduceDocuments = require('../CorpusReducer');
var chai = require('chai');
var sinon = require('sinon');

sinon.assert.expose(chai.assert, { prefix: "" });

function sinonSuite(suite) {
  var sandbox;

  suite.beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  suite.afterEach(function() {
    sandbox.restore();
  });

  return function getSandbox() {
    return sandbox;
  }
}

describe('cjs::render', function() {
  var database;
  var getSandbox = sinonSuite(this);
  var renderMarkdown, linkify;

  beforeEach(function() {
    database = TestUtils.parseInline(function() {;
      // /**
      //  * @namespace Core
      //  * @module
      //  *
      //  * A _storage_ module.
      //  */
      // function Cache() {}
      //
      // /**
      //  * Add an item to the cache.
      //  *
      //  * @param {String} id
      //  *        A _unique_ record identifier.
      //  *
      //  * @example
      //  *
      //  * Hello!
      //  */
      // Cache.prototype.add = function(id) {
      // };
    });

    renderMarkdown = getSandbox().stub().returnsArg(0);
    linkify = getSandbox().spy(function(x) { return x.text; });

    render(reduceDocuments({
      documents: database,
      namespaceId: 'test',
      namespaceTitle: 'JavaScript Test',
      baseURL: '/test',
    }), renderMarkdown, linkify);
  });

  it('renders doc.description', function() {
    assert.calledWith(linkify, sinon.match({
      text: 'A _storage_ module.',
      contextNode: sinon.match({ id: 'Cache' })
    }));

    assert.calledWith(renderMarkdown, 'A _storage_ module.');
  });

  it('renders doc.tags.[].typeInfo.string', function() {
    assert.calledWith(linkify, sinon.match({
      text: 'A _unique_ record identifier.',
      contextNode: sinon.match({ id: '#add' })
    }));

    assert.calledWith(renderMarkdown, 'A _unique_ record identifier.');
  });

  it('renders the "string" of an @example tag', function() {
    assert.calledWith(linkify, sinon.match({
      text: '\nHello!',
      contextNode: sinon.match({ id: '#add' })
    }));

    assert.calledWith(renderMarkdown, '\nHello!');
  });
});