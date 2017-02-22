var render = require('../render');
var assert = require('chai').assert;
var TestUtils = require('jsdoc-parser-extended/lib/TestUtils');
var sinonSuite = require('megadoc/lib/TestUtils').sinonSuite;
var createCompiler = require('megadoc/lib/TestUtils').createCompiler;
var reduceDocuments = require('../reduce');

describe('cjs::render', function() {
  var database;
  var sinon = sinonSuite(this);
  var renderMarkdown, linkify, renderLink, compiler;

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
      //  * @param {Foo|null}
      //  * @example
      //  *
      //  * Hello!
      //  */
      // Cache.prototype.add = function(id, foo) {
      // };
      //
      // /**
      //  * @module Foo
      //  */
      //  function Foo() {}
    });

    renderMarkdown = sinon.stub().returnsArg(0);
    linkify = sinon.spy(function(x) { return x.text; });
    compiler = createCompiler();

    renderLink = sinon.spy(compiler.linkResolver, 'renderLink');

    render(compiler, reduceDocuments({
      documents: database,
      namespaceId: 'test',
      namespaceTitle: 'JavaScript Test',
      baseURL: '/test',
    }), renderMarkdown, linkify, {});
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

  it.skip('renders the "string" of an @example tag', function() {
    assert.calledWith(linkify, sinon.match({
      text: '\nHello!',
      contextNode: sinon.match({ id: '#add' })
    }));

    assert.calledWith(renderMarkdown, '\nHello!');
  });

  describe('tag rendering', function() {
    it('linkifies custom types', function() {
      assert.calledWith(renderLink, sinon.match({
        strict: true,
        contextNode: sinon.match({ id: '#add' }),
      }), sinon.match({
        path: 'Foo',
      }));
    });
  });
});
