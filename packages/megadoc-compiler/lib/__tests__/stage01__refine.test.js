const { assert, createFileSuite: FileSuite } = require('megadoc-test-utils');
const subject = require('../refine');

describe('megadoc-compiler::refine', function() {
  const fileSuite = FileSuite(this);

  it('should apply the processor refiner', function(done) {
    const refineFnFile = fileSuite.createFile('parse.js', `
      module.exports = function(options, rawDocuments, done) {
        done(null, rawDocuments.map(rawDocument => {
          return Object.assign({}, rawDocument, {
            title: rawDocument.id,
          })
        }));
      };
    `);

    const compilation = {
      decorators: [],

      files: [
        'a',
      ],

      rawDocuments: [
        {
          id: 'doc1'
        },
        {
          id: 'doc2'
        }
      ],

      processor: {
        refineFnPath: refineFnFile.path,
      }
    };

    subject(compilation, function(err, { refinedDocuments }) {
      if (err) {
        done(err);
      }
      else {
        assert.equal(refinedDocuments.length, 2);
        assert.equal(refinedDocuments[0].title, 'doc1');
        assert.equal(refinedDocuments[1].title, 'doc2');

        done();
      }
    });
  });

});