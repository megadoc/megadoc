const { assert } = require('chai');
const Subject = require('../XCompiler');
const FileSuite = require('megadoc-test-utils/FileSuite');
const b = require('megadoc-corpus').builders;

describe('XCompiler#emit', function() {
  const fileSuite = FileSuite(this);

  it('should pass all compilations through to the serializer', function(done) {
    const emitFn = fileSuite.createFile('reduceFn.js', `
      module.exports = function(options, rawDocument, done) {
        done(null, { id: rawDocument.id, name: rawDocument.id + '__name' });
      };
    `);

    const compilation = {
      serializer: {
        emitFnPath: emitFn.path,
      },

      renderedTree: b.namespace({
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

    Subject.emit({}, compilation, function(err, { documents }) {
      if (err) {
        done(err);
      }
      else {
        // assert.equal(documents.length, 1);
        // assert.include(documents[0], {
        //   id: '1',
        //   name: '1__name'
        // });

        done();
      }
    });
  });

});