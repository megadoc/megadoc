const createProfiler = require('../createProfiler');
const { assert, createSinonSuite } = require('megadoc-test-utils');

describe("megadoc-compiler::utils::createProfiler", function() {
  const sinon = createSinonSuite(this);

  it('works', function() {
    const fn = function() {};
    const benchmarks = [];
    const writeFn = x => benchmarks.push(x)
    const instrument = createProfiler({ enabled: true, writeFn })

    instrument('foo')(fn)();

    assert.equal(benchmarks.length, 1);
    assert.equal(benchmarks[0].stage, 'foo')
    assert.equal(typeof benchmarks[0].elapsed, 'number')
  });

  it('passes the arguments', function() {
    const fn = sinon.spy(function() {});
    const instrument = createProfiler({})

    instrument('foo')(fn)(1, 2, 3);

    assert.calledWithExactly(fn, 1, 2, 3)
  })

  it('returns the return value', function() {
    const fn = x => x + 1;
    const instrument = createProfiler({})

    assert.equal(instrument('foo')(fn)(1), 2);
  })

  context('when not enabled...', function() {
    it('still invokes the function', function() {
      const fn = sinon.spy(function(x, y) { return x + y; });
      const instrument = createProfiler({ enabled: false })

      const result = instrument.async('foo')(fn)(1, 1);

      assert.calledWithExactly(fn, 1, 1);
      assert.equal(result, 2)
    })
  })

  describe('#asyncInstrument', function() {
    it('works', function(done) {
      const fn = function(callback) { callback() };
      const benchmarks = [];
      const writeFn = x => benchmarks.push(x)
      const instrument = createProfiler({ enabled: true, writeFn })

      instrument.async('foo')(fn)(function() {
        assert.equal(benchmarks.length, 1);
        assert.equal(benchmarks[0].stage, 'foo')
        assert.equal(typeof benchmarks[0].elapsed, 'number')

        done();
      });
    });

    it('passes the arguments', function(done) {
      const fn = sinon.spy(function(x, y, callback) { callback() });
      const instrument = createProfiler({ enabled: true })

      instrument.async('foo')(fn)(1, 1, function() {
        assert.calledWithExactly(fn, 1, 1, sinon.match.func);
        done();
      });
    });

    it('passes the return value', function(done) {
      const fn = function(x, y, callback) { callback(null, x + y) };
      const instrument = createProfiler({ enabled: true })

      instrument.async('foo')(fn)(1, 1, function(err, result) {
        assert.equal(result, 2);
        done();
      });
    });

    context('when not enabled...', function() {
      it('still invokes the function', function(done) {
        const fn = sinon.spy(function(x, y, callback) { callback(null, x + y) });
        const instrument = createProfiler({ enabled: false })

        instrument.async('foo')(fn)(1, 1, function(err, result) {
          assert.calledWithExactly(fn, 1, 1, sinon.match.func);
          assert.equal(result, 2)
          done();
        });
      })
    })
  })
});