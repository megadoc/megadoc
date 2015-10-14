var assert = require('chai').assert;

describe('Compiler', function() {
  describe('#run', function() {
    var subject, hookCalled;

    beforeEach(function() {
      subject = global.TestUtils.createCompiler();
      hookCalled = false;
    });

    afterEach(function() {
      assert.ok(hookCalled);
    });

    it('performs "scan"', function(done) {
      subject.on('scan', function(scanDone) {
        hookCalled = true;

        assert.equal(arguments.length, 1);
        assert.equal(typeof scanDone, 'function');

        scanDone();
      });

      subject.run({ scan: true, index: true }, done);
    });

    it('performs "index"', function(done) {
      subject.on('index', function(registry, indexDone) {
        hookCalled = true;

        assert.equal(arguments.length, 2);
        assert.equal(registry.constructor.name, 'Registry');
        assert.equal(typeof indexDone, 'function');

        indexDone();
      });

      subject.run({ scan: true, index: true }, done);
    });

    it('performs "render"', function(done) {
      subject.on('render', function(md, linkify, renderDone) {
        hookCalled = true;

        assert.equal(arguments.length, 3);
        assert.equal(typeof md, 'function');
        assert.equal(typeof linkify, 'function');
        assert.equal(typeof renderDone, 'function');

        renderDone();
      });

      subject.run({ scan: true, index: true, render: true }, done);
    });

    it('performs "write"', function(done) {
      subject.on('write', function(writeDone) {
        hookCalled = true;

        assert.equal(arguments.length, 1);
        assert.equal(typeof writeDone, 'function');

        writeDone();
      });

      subject.run({ scan: true, index: true, render: true, write: true }, done);
    });

    it('performs "stats"');
  });
});