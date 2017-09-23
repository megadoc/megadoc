require('../../');

var assert = require('megadoc-test-utils').assert;
var Subject = require("../CorpusTypes");
var b = Subject.builders;

describe("CorpusTypes", function() {
  it('works', function() {
    benchmark({ times: 1, log: false }, function() {
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

  describe('.getTypeChain', function() {
    it('works', function() {
      Subject.def("Foo", {
        fields: {}
      });

      Subject.def("Bar", {
        base: "Foo",
        fields: {}
      });

      assert.deepEqual(Subject.getTypeChain('Foo'), [ 'Foo' ]);
      assert.deepEqual(Subject.getTypeChain('Bar'), [ 'Foo', 'Bar' ]);
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