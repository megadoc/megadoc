const { assert, createFileSuite: FileSuite } = require('megadoc-test-utils');
const subject = require('../stage01__reduce');

describe('stage01__reduce', function() {
  const fileSuite = FileSuite(this);

  it('should pass each file through to the reducer', function(done) {
    const reduceFnFile = fileSuite.createFile('reduceFn.js', `
      module.exports = function(context, actions, rawDocument, done) {
        done(null, { id: rawDocument.id, name: rawDocument.id + '__name' });
      };
    `);

    const compilation = {
      files: [
        'a',
        'b',
      ],

      compilerOptions: {},

      processor: {
        reduceFnPath: reduceFnFile.path,
      },

      refinedDocuments: [
        {
          id: '1'
        }
      ]
    };

    subject({}, compilation, function(err, { documents }) {
      if (err) {
        done(err);
      }
      else {
        assert.equal(documents.length, 1);
        assert.include(documents[0], {
          id: '1',
          name: '1__name'
        });

        done();
      }
    });
  });
});