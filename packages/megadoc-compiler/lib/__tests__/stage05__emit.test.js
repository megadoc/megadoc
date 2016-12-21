const { assert } = require('chai');
const subject = require('../stage05__emit');
const FileSuite = require('megadoc-test-utils/FileSuite');
const SinonSuite = require('megadoc-test-utils/SinonSuite');
const b = require('megadoc-corpus').builders;

describe('stage05__emit', function() {
  const fileSuite = FileSuite(this);
  const sinon = SinonSuite(this);

  it('should pass all compilations through to the serializer', function(done) {
    const emitFn = fileSuite.createFile('reduceFn.js', `
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
      emitCorpusDocuments: sinon.spy(function(renderedTrees, callback) {
        callback(null, renderedTrees);
      }),
    };

    subject(serializer, compilation, function(err, output) {
      if (err) {
        done(err);
      }
      else {
        assert.calledWith(serializer.emitCorpusDocuments, compilation)
        assert.equal(output, compilation,
          "it passes the compilation through as-is"
        );

        done();
      }
    });
  });

});