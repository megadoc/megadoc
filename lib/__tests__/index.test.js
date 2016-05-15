var subject = require('../');
var assert = require('chai').assert;
var path = require('path');
var assign = require('lodash').assign;
var sinon = require('sinon');
var TestUtils = require('../TestUtils');

sinon.assert.expose(assert, { prefix: "" });

var contentBase = TestUtils.contentBase;
var defaults = {
  tmpDir: path.join(contentBase, '.junk'),
  outputDir: path.join(contentBase, 'compiled'),
  assetRoot: path.join(contentBase, 'src'),
};

describe('megadoc', function() {
  it('works', function() {
    subject(defaults);
  });

  it('accepts plugins', function() {
    var run = sinon.stub();

    subject(assign({}, defaults, { plugins: [{ run: run }] }));

    assert.called(run);
  });

  it('whines if a plugin does not implement #run', function() {
    assert.throws(function() {
      subject(assign({}, defaults, { plugins: [{}] }));
    }, "A plugin must define a 'run' function.");
  });
});