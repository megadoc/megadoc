const { assert, createFileSuite: FileSuite, createSinonSuite: SinonSuite } = require('megadoc-test-utils');
const subject = require('../emit');
const b = require('megadoc-corpus').builders;

describe('emit', function() {
  const fileSuite = FileSuite(this);
  const sinon = SinonSuite(this);

  it('should pass all compilations through to the serializer', function(done) {
    fileSuite.createFile('reduceFn.js', `
      module.exports = function(options, rawDocument, done) {
        done(null, { id: rawDocument.id, name: rawDocument.id + '__name' });
      };
    `);

    const compilation = {
      // serializer: {
      //   emitFnPath: emitFn.path,
      // },

      corpus: b.namespace({
        id: 'test',
        name: 'Test',
        documents: [
          b.document({
            id: 'moduleA',
            properties: {
              text: 'hahaay',
            },
          }),

          b.document({
            id: 'moduleB',
            properties: {
              text: 'hohoho',
            },
          })
        ]
      })
    };

    const serializer = {
      emit: sinon.spy(function(renderedTrees, callback) {
        callback(null, renderedTrees);
      }),
    };

    subject(serializer, compilation, function(err, output) {
      if (err) {
        done(err);
      }
      else {
        assert.calledWith(serializer.emit, compilation)
        assert.equal(output, compilation,
          "it passes the compilation through as-is"
        );

        done();
      }
    });
  });

});