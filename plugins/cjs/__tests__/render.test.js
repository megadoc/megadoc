var render = require('../render');
var indexEntities = require('../indexEntities');
var assert = require('chai').assert;
var TestUtils = require('../Parser/TestUtils');
var Renderer = require('../../../lib/Renderer');
var LinkResolver = require('../../../lib/LinkResolver');

describe('cjs::render', function() {
  var database, registry, linkResolver, renderer;
  var getSandbox = global.TestUtils.sinonSuite(this);
  var renderMarkdown, linkify;

  beforeEach(function() {
    database = TestUtils.parseInline(function() {
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
    linkify = getSandbox().stub().returnsArg(0);

    render(database, renderMarkdown, linkify);
  });

  it('renders doc.description', function() {
    assert.calledWith(linkify, 'A _storage_ module.', 'Core.Cache');
    assert.calledWith(renderMarkdown, 'A _storage_ module.');
  });

  it('renders doc.tags.[].typeInfo.string', function() {
    assert.calledWith(linkify, 'A _unique_ record identifier.', 'Core.Cache');
    assert.calledWith(renderMarkdown, 'A _unique_ record identifier.');
  });

  it('renders the "string" of an @example tag', function() {
    assert.calledWith(linkify, '\nHello!', 'Core.Cache');
    assert.calledWith(renderMarkdown, '\nHello!');
  });
});