require('../../');

var assert = require('chai').assert;
var Subject = require("../CorpusTypes");
var b = Subject.builders;

describe("CorpusTypes", function() {

  describe('type checkers', function() {
    it('works with primitive types [String]', function() {
      b.property({
        key: 'foo',
        value: 'bar'
      });

      assert.throws(function() {
        b.property({
          key: 5,
          value: 'bar'
        });
      }, "TypeError: Expected a value of type 'String', not 'Number'");
    });

    it('works with custom types [Property]', function() {
      Subject.def("Foo", {
        fields: {
          id: "Property"
        }
      });

      Subject.finalize();

      assert.throws(function() {
        b.foo({
          id: '5'
        });
      }, "TypeError: Expected a value of type 'Property', not 'String'");
    });

    it('works with an array of types [array(...)]', function() {
      Subject.def("Foo", {
        fields: {
          id: Subject.array("Property", String, null)
        }
      });

      Subject.finalize();

      b.foo({ id: [ b.property({ key: 'foo', value: 'bar' }) ] });
      b.foo({ id: [ '5' ] });
      b.foo({ id: [ null ] });

      assert.throws(function() {
        b.foo({ id: [ 5 ] });
      }, /TypeError: Expected value at \[0\] to be of one of the types.*not 'Number'/);
    });

    it('works with union types [or(...)]', function() {
      Subject.def("Foo", {
        fields: {
          id: Subject.or(String, Number, null)
        }
      });

      Subject.finalize();

      b.foo({ id: 5 });
      b.foo({ id: '5' });
      b.foo({ id: null });

      assert.throws(function() {
        b.foo({ id: [ 5 ] });
      }, /TypeError: Expected value to be of one of the types.*not 'Array.<Number>'/);
    });
  });

  it('works', function() {
    benchmark({ times: 1 }, function() {
      b.document({
        id: 'd1',
        entities:
        [
          b.documentEntity({
            id: 'd1#a',
          }),
        ],
        documents: [
          b.document({
            id: 'd2',
            entities: [
              b.documentEntity({
                id: 'd2#a',
              })
            ]
          })
        ]
      });
    });
  });

  describe('builders', function() {
    it.skip('should work with non-object parameters for types that support it', function() {
      assert.equal(b.literal('foo').value, 'foo');
      assert.equal(b.property(b.literal('foo'), 'bar').key.value, 'foo');
      assert.equal(b.property(b.literal('foo'), 'bar').value, 'bar');
    });
  });
});

function benchmark(options, fn) {
  var startTime = new Date();
  var i;

  if (options.log !== false) {
    console.log('Benchmark: applying %d iterations...', options.times);
  }

  for (i = 0; i < options.times; ++i) {
    fn();
  }

  var endTime = new Date();
  var delta = endTime - startTime;

  if (options.log !== false) {
    console.log('Benchmark: %d iterations complete in %d ms', options.times, delta);
  }

  return delta;
}