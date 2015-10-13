var Compiler = require('../Compiler');
var sinon = require('sinon');

var path = require('path');
var merge = require('lodash').merge;
var assert = require('chai').assert;

var defaults = {
  tmpDir: path.resolve(__dirname, '..', '..', 'tmp')
};

function configure(options) {
  return merge(defaults, options);
}

describe('Compiler', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#run', function() {
    var subject, dummyPlugin;

    beforeEach(function() {
      dummyPlugin = {
        scan: sandbox.stub(),
        index: sandbox.stub(),

        run: function(compiler) {
          compiler.on('scan', function(done) {
            dummyPlugin.scan();
            done();
          });

          compiler.on('index', function(registry, done) {
            dummyPlugin.index(registry);

            done();
          });
        }
      };

      subject = new Compiler(configure({
        plugins: [dummyPlugin]
      }));
    });

    it('performs "scan"', function(done) {
      subject.run(function(err) {
        assert.calledOnce(dummyPlugin.scan);
        done(err);
      }, { scan: true })
    });

    it('performs "index"', function(done) {
      subject.run(function(err) {
        assert.calledOnce(dummyPlugin.scan);
        assert.calledOnce(dummyPlugin.index);
        assert.calledWith(dummyPlugin.index, subject.registry);

        done(err);
      }, { scan: true, index: true })
    });

    it('performs "render"');
    it('performs "write"');
    it('performs "stats"');
  });
});